import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Album, Photo, SiteSettings, SeoSettings } from '../types';
import * as bucketService from '../services/bucketService';
import { generatePhotoDescription, generateSeoSuggestions, searchPhotosInAlbum } from '../services/geminiService';
import { storage } from '../firebaseConfig';
import { ref, listAll, getDownloadURL } from 'firebase/storage';

interface AppContextType {
  albums: Album[];
  siteSettings: SiteSettings;
  loading: boolean;
  addAlbum: (title: string) => Promise<void>;
  updateAlbum: (albumId: string, newTitle: string, newCoverPhotoUrl: string) => Promise<void>;
  deleteAlbum: (albumId: string) => Promise<void>;
  addPhotoToAlbum: (albumId: string, photoFile: File, title: string, skipSave?: boolean) => Promise<{ photo: any, albums: Album[] } | void>;
  uploadPhotoOnly: (photoFile: File, title: string) => Promise<Photo>;
  updatePhotoUrls: (photoId: string, urls: { optimizedUrl?: string, thumbUrl?: string, mediumUrl?: string, needsWebPRetry?: boolean }) => void;
  checkWebPGeneration: (photo: Photo) => Promise<{ optimizedUrl?: string, thumbUrl?: string, mediumUrl?: string }>;
  refreshWebPUrls: (albumId: string) => Promise<void>;
  deletePhotosFromAlbum: (albumId: string, photoIds: string[]) => Promise<void>;
  updateAlbumPhotos: (albumId: string, photos: Photo[]) => Promise<void>;
  updateSiteSettings: (newSettings: Partial<SiteSettings>, newLogoFile?: File) => Promise<void>;
  getAlbumById: (albumId: string) => Album | undefined;
  getSeoSuggestions: () => Promise<SeoSettings>;
  searchPhotos: (albumId: string, query: string) => Promise<string[]>;
  saveBatchPhotos: (albumId: string, photos: any[]) => Promise<void>;
  recoverFromStorage: () => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({ 
    appName: 'AI Gallery',
    logoUrl: null, 
    footerText: '',
    navLinks: [],
    gtmId: '',
    siteUrl: '',
    seo: {
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      structuredData: ''
    },
    preloader: {
      enabled: true,
      style: 'glassmorphism',
      backgroundColor: '#0f172a',
      primaryColor: '#14b8a6',
      secondaryColor: '#8b5cf6',
      showLogo: true,
      showProgress: true,
      customText: 'Loading your moments...',
      animationSpeed: 'normal'
    }
  });
  const [loading, setLoading] = useState(true);
  
  // Counter to ensure absolutely unique IDs even in rapid succession
  const photoIdCounterRef = React.useRef(0);
  
  // 🚦 WebP Check Queue Management (prevent timer overload)
  const webpCheckQueueRef = React.useRef<{
    queue: { photo: Photo, attempts: number }[],
    processing: boolean,
    maxConcurrent: number,
    activeChecks: Set<string> // 🔒 Track photos being checked to prevent conflicts
  }>({
    queue: [],
    processing: false,
    maxConcurrent: 5, // 🚀 Reduced to 5 (was 10) - less stress on Cloud Functions
    activeChecks: new Set()
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const config = await bucketService.getConfig();
        
        // 🔧 AUTO-FIX: Remove Admin Panel from navbar if present
        const hasAdminInNav = config.siteSettings.navLinks?.some(link => 
          link.to === '/admin' || link.text.toLowerCase().includes('admin')
        );
        
        if (hasAdminInNav) {
          console.log('🔧 Auto-fixing: Removing Admin Panel from navbar');
          const cleanedNavLinks = config.siteSettings.navLinks.filter(link => 
            link.to !== '/admin' && !link.text.toLowerCase().includes('admin')
          );
          
          const updatedSettings = {
            ...config.siteSettings,
            navLinks: cleanedNavLinks
          };
          
          // Save the cleaned configuration
          await bucketService.saveConfig({
            albums: config.albums,
            siteSettings: updatedSettings
          });
          
          setAlbums(config.albums);
          setSiteSettings(updatedSettings);
        } else {
          setAlbums(config.albums);
          setSiteSettings(config.siteSettings);
        }
      } catch (error) {
        console.error("Failed to load app config:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Auto-save when albums change (for WebP URL updates)
  const [lastSaveTime, setLastSaveTime] = useState(0);
  useEffect(() => {
    if (loading) return; // Don't save during initial load
    
    const now = Date.now();
    if (now - lastSaveTime < 1000) return; // Debounce saves (max 1 per second)
    
    const saveChanges = async () => {
      try {
        await saveCurrentConfig(albums, siteSettings);
        setLastSaveTime(now);
        console.log('💾 Auto-saved WebP URL updates');
      } catch (error) {
        console.warn('⚠️ Auto-save failed:', error);
      }
    };
    
    const timeoutId = setTimeout(saveChanges, 500); // Debounce 500ms
    return () => clearTimeout(timeoutId);
  }, [albums, siteSettings, loading, lastSaveTime]);

  // 🔄 Periodic WebP retry system for photos that need it
  useEffect(() => {
    if (loading) return;
    
    const retryWebPForFailedPhotos = async () => {
      // Find all photos that need WebP retry
      const photosNeedingRetry: Photo[] = [];
      albums.forEach(album => {
        album.photos.forEach(photo => {
          if (photo.needsWebPRetry) {
            photosNeedingRetry.push(photo);
          }
        });
      });
      
      if (photosNeedingRetry.length === 0) return;
      
      console.log(`🔄 Periodic WebP retry for ${photosNeedingRetry.length} photos`);
      
      // Check each photo for WebP availability
      for (const photo of photosNeedingRetry) {
        const queue = webpCheckQueueRef.current;
        
        // 🔒 Skip if photo is already being checked by queue system
        if (queue.activeChecks.has(photo.id)) {
          console.log(`⏭️ Periodic retry skipping ${photo.id} - already being checked by queue`);
          continue;
        }
        
        // 🔒 Lock this photo for periodic checking
        queue.activeChecks.add(photo.id);
        
        try {
          const webpUrls = await checkWebPGeneration(photo);
          if (webpUrls.optimizedUrl || webpUrls.thumbUrl || webpUrls.mediumUrl) {
            console.log(`🎉 Periodic retry success for ${photo.id}:`, webpUrls);
            // Remove retry flag and update with WebP URLs
            updatePhotoUrls(photo.id, { 
              ...webpUrls, 
              needsWebPRetry: false // Clear the retry flag
            });
          }
        } catch (error) {
          console.warn(`⚠️ Periodic retry failed for ${photo.id}:`, error);
        } finally {
          // 🔓 Always unlock the photo when done
          queue.activeChecks.delete(photo.id);
        }
        
        // Small delay between checks to avoid overwhelming
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    };
    
    // Run periodic retry every 1 minute (was 5 minutes)
    const intervalId = setInterval(retryWebPForFailedPhotos, 1 * 60 * 1000);
    
    // Also run once after 30 seconds on load
    const initialTimeoutId = setTimeout(retryWebPForFailedPhotos, 30000);
    
    // 🚨 EMERGENCY FALLBACK: Force fallback for photos stuck on "Optimizing..." after 3 minutes
    const emergencyFallbackId = setTimeout(() => {
      console.log('🚨 Emergency fallback: Converting stuck photos to use original URLs');
      
      albums.forEach(album => {
        album.photos.forEach(photo => {
          // If photo has no WebP URLs and no retry flag, it's stuck on "Optimizing..."
          if (!photo.optimizedUrl && !photo.thumbUrl && !photo.mediumUrl && !photo.needsWebPRetry) {
            console.log(`🚨 Emergency fallback for stuck photo: ${photo.id}`);
            updatePhotoUrls(photo.id, {
              optimizedUrl: photo.url,
              thumbUrl: photo.url,
              mediumUrl: photo.url,
              needsWebPRetry: false
            });
          }
        });
      });
    }, 3 * 60 * 1000); // 3 minutes emergency timeout
    
    return () => {
      clearInterval(intervalId);
      clearTimeout(initialTimeoutId);
      clearTimeout(emergencyFallbackId);
    };
  }, [albums, loading]);

  const saveCurrentConfig = async (updatedAlbums: Album[], updatedSettings: SiteSettings) => {
    await bucketService.saveConfig({ albums: updatedAlbums, siteSettings: updatedSettings });
  };

  const getAlbumById = (albumId: string): Album | undefined => {
    return albums.find(album => album.id === albumId);
  };

  const addAlbum = async (title: string) => {
    const newAlbum: Album = {
      id: `album-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
      title,
      coverPhotoUrl: 'https://placehold.co/800x600/1a202c/4a5568?text=No+Photos', // Placeholder
      photos: [],
    };
    
    let finalAlbums: Album[] = [];
    setAlbums(prevAlbums => {
      const updatedAlbums = [...prevAlbums, newAlbum];
      finalAlbums = updatedAlbums;
      return updatedAlbums;
    });
    
    await saveCurrentConfig(finalAlbums, siteSettings);
  };
  
  const updateAlbum = async (albumId: string, newTitle: string, newCoverPhotoUrl: string) => {
    let finalAlbums: Album[] = [];
    
    setAlbums(prevAlbums => {
      const updatedAlbums = prevAlbums.map(album => {
          if (album.id === albumId) {
              return { ...album, title: newTitle, coverPhotoUrl: newCoverPhotoUrl };
          }
          return album;
      });
      finalAlbums = updatedAlbums;
      return updatedAlbums;
    });
    
    await saveCurrentConfig(finalAlbums, siteSettings);
  };

  const deleteAlbum = async (albumId: string) => {
    // Find album to delete (read current state)
    const albumToDelete = albums.find(a => a.id === albumId);
    if (!albumToDelete) return;

    // Delete all photos associated with the album from the bucket
    for (const photo of albumToDelete.photos) {
      if (photo.path) {
        await bucketService.deleteFile(photo.path);
      }
    }

    let finalAlbums: Album[] = [];
    setAlbums(prevAlbums => {
      const updatedAlbums = prevAlbums.filter(album => album.id !== albumId);
      finalAlbums = updatedAlbums;
      return updatedAlbums;
    });
    
    await saveCurrentConfig(finalAlbums, siteSettings);
  };

  const addPhotoToAlbum = async (albumId: string, photoFile: File, title: string, skipSave = false) => {
      // 🚀 STEP 1: Upload file (fast - no conversion)
      const { path, url, optimizedUrl, thumbUrl, mediumUrl } = await bucketService.uploadFile(photoFile);
      
      // 🤖 STEP 2: Generate AI description (non-blocking if enabled)
      // Don't await - description can be added later if needed
      let description = "";
      if (siteSettings.aiEnabled && siteSettings.geminiApiKey) {
        // Fire and forget - description generation won't block upload
        generatePhotoDescription(photoFile, siteSettings.geminiApiKey)
          .then(desc => {
            console.log('🤖 AI description generated:', desc);
            // TODO: Could update photo description in background if needed
          })
          .catch(err => {
            console.warn('⚠️ AI description failed:', err);
          });
      }

      // 🆔 Generate guaranteed unique ID
      photoIdCounterRef.current += 1;
      const uniqueId = `photo-${Date.now()}-${photoIdCounterRef.current}-${crypto.randomUUID().slice(0, 8)}`;

      const newPhoto: Photo = {
          id: uniqueId,
          url,                              // Original (always available)
          optimizedUrl: optimizedUrl,       // Will be undefined initially
          thumbUrl: thumbUrl || undefined,  // Will be undefined initially
          mediumUrl: mediumUrl || undefined, // Will be undefined initially
          path,
          title: title || "", // Empty title by default
          description,        // Empty initially if AI is slow
      };

      // 📊 STEP 3: Update local state
      let finalAlbums: Album[] = [];
      
      setAlbums(prevAlbums => {
          const updatedAlbums = prevAlbums.map(album => {
              if (album.id === albumId) {
              const updatedPhotos = [...album.photos, newPhoto];
              // If this is the first photo, make it the cover
              // Priority: optimizedUrl > mediumUrl > thumbUrl > url
              if (updatedPhotos.length === 1) {
                  return { 
                    ...album, 
                    photos: updatedPhotos, 
                    coverPhotoUrl: newPhoto.optimizedUrl || newPhoto.mediumUrl || newPhoto.thumbUrl || newPhoto.url 
                  };
              }
                  return { ...album, photos: updatedPhotos };
              }
              return album;
          });
          
          finalAlbums = updatedAlbums;
          return updatedAlbums;
      });

      // 💾 STEP 4: Save to Firestore (only if not skipping for batch operations)
      if (!skipSave) {
        await saveCurrentConfig(finalAlbums, siteSettings);
      }
      
      return { photo: newPhoto, albums: finalAlbums };
  };

  // 🚀 NEW: Upload photo WITHOUT updating state (for batch operations)
  const uploadPhotoOnly = async (photoFile: File, title: string): Promise<Photo> => {
    // 🚀 STEP 1: Upload file (fast - no conversion)
    const { path, url, optimizedUrl, thumbUrl, mediumUrl } = await bucketService.uploadFile(photoFile);
    
    // 🤖 STEP 2: Generate AI description (non-blocking if enabled)
    let description = "";
    if (siteSettings.aiEnabled && siteSettings.geminiApiKey) {
      // Fire and forget - description generation won't block upload
      generatePhotoDescription(photoFile, siteSettings.geminiApiKey)
        .then(desc => {
          console.log('🤖 AI description generated:', desc);
        })
        .catch(err => {
          console.warn('⚠️ AI description failed:', err);
        });
    }

    // 🆔 Generate guaranteed unique ID
    photoIdCounterRef.current += 1;
    const uniqueId = `photo-${Date.now()}-${photoIdCounterRef.current}-${crypto.randomUUID().slice(0, 8)}`;

    const newPhoto: Photo = {
      id: uniqueId,
      url,
      optimizedUrl: optimizedUrl,
      thumbUrl: thumbUrl || undefined,
      mediumUrl: mediumUrl || undefined,
      path,
      title: title || "",
      description,
    };

    return newPhoto;
  };

  // 🔄 Update photo URLs when WebP versions are generated by Cloud Functions
  const updatePhotoUrls = (photoId: string, urls: { optimizedUrl?: string, thumbUrl?: string, mediumUrl?: string, needsWebPRetry?: boolean }) => {
    setAlbums(prevAlbums => {
      return prevAlbums.map(album => ({
        ...album,
        photos: album.photos.map(photo => 
          photo.id === photoId 
            ? { ...photo, ...urls }
            : photo
        )
      }));
    });
  };

  // 🔍 Check if WebP versions have been generated for a photo
  const checkWebPGeneration = async (photo: Photo): Promise<{ optimizedUrl?: string, thumbUrl?: string, mediumUrl?: string }> => {
    if (!photo.path) return {};
    
    const baseFileName = photo.path.split('/').pop()!;
    // 🚨 FIX: Keep full filename, just replace extension like Cloud Function does
    // Cloud Function: fileName.replace(/\.[^.]+$/, `${suffix}.webp`)
    
    const urls: { optimizedUrl?: string, thumbUrl?: string, mediumUrl?: string } = {};
    
    try {
      // Check for optimized WebP (matches Cloud Function naming)
      try {
        const optimizedFileName = baseFileName.replace(/\.[^.]+$/, '_optimized.webp');
        const optimizedRef = ref(storage, `uploads/${optimizedFileName}`);
        urls.optimizedUrl = await getDownloadURL(optimizedRef);
      } catch (e) { /* Not ready yet */ }
      
      // Check for 200px thumbnail
      try {
        const thumbFileName = baseFileName.replace(/\.[^.]+$/, '_thumb_200.webp');
        const thumbRef = ref(storage, `uploads/${thumbFileName}`);
        urls.thumbUrl = await getDownloadURL(thumbRef);
      } catch (e) { /* Not ready yet */ }
      
      // Check for 800px thumbnail
      try {
        const mediumFileName = baseFileName.replace(/\.[^.]+$/, '_thumb_800.webp');
        const mediumRef = ref(storage, `uploads/${mediumFileName}`);
        urls.mediumUrl = await getDownloadURL(mediumRef);
      } catch (e) { /* Not ready yet */ }
      
    } catch (error) {
      console.warn(`⚠️ Error checking WebP for ${photo.id}:`, error);
    }
    
    return urls;
  };

  // 🚦 Queue-based WebP monitoring (prevents timer overload)
  const addToWebPQueue = (photo: Photo) => {
    const queue = webpCheckQueueRef.current;
    
    // 🔒 Skip if photo is already being checked
    if (queue.activeChecks.has(photo.id)) {
      console.log(`🔄 Photo ${photo.id} already being checked - skipping queue add`);
      return;
    }
    
    // Check if photo already in queue
    const existingIndex = queue.queue.findIndex(item => item.photo.id === photo.id);
    if (existingIndex >= 0) {
      console.log(`🔄 Photo ${photo.id} already in WebP queue`);
      return;
    }
    
    // Add to queue
    queue.queue.push({ photo, attempts: 0 });
    console.log(`➕ Added ${photo.id} to WebP queue (${queue.queue.length} total)`);
    
    // Start processing if not already running
    if (!queue.processing) {
      processWebPQueue();
    }
  };

  const processWebPQueue = async () => {
    const queue = webpCheckQueueRef.current;
    if (queue.processing || queue.queue.length === 0) return;
    
    queue.processing = true;
    console.log(`🚦 Starting WebP queue processing (${queue.queue.length} photos)`);
    
    while (queue.queue.length > 0) {
      // Process up to maxConcurrent photos at once
      const batch = queue.queue.splice(0, queue.maxConcurrent);
      
      const batchPromises = batch.map(async (item) => {
        const { photo, attempts } = item;
        const maxAttempts = 5; // 🚀 Reduced: ~5 minutes max wait, then fallback to original
        
        // 🔒 Check if photo is already being processed
        if (queue.activeChecks.has(photo.id)) {
          console.log(`⏭️ Skipping ${photo.id} - already being checked`);
          return false;
        }
        
        // 🔒 Lock this photo for checking
        queue.activeChecks.add(photo.id);
        
        try {
          console.log(`🔍 WebP check attempt ${attempts + 1}/${maxAttempts} for ${photo.id}`);
          
          const webpUrls = await checkWebPGeneration(photo);
          
          if (webpUrls.optimizedUrl || webpUrls.thumbUrl || webpUrls.mediumUrl) {
            console.log(`🎉 WebP ready for ${photo.id}:`, webpUrls);
            updatePhotoUrls(photo.id, { 
              ...webpUrls, 
              needsWebPRetry: false // Clear retry flag when WebP found
            });
            return true; // Success
          }
          
          // No WebP ready, re-queue if under max attempts
          if (attempts + 1 < maxAttempts) {
            queue.queue.push({ photo, attempts: attempts + 1 });
            return false; // Will retry
          } else {
            console.warn(`⚠️ WebP timeout for ${photo.id} after ${maxAttempts} attempts - using original as fallback`);
            // 🚀 FALLBACK: Use original URL if WebP generation takes too long
            updatePhotoUrls(photo.id, { 
              optimizedUrl: photo.url, // Use original as optimized fallback
              thumbUrl: photo.url,     // Use original as thumb fallback
              mediumUrl: photo.url,    // Use original as medium fallback
              needsWebPRetry: true     // 🏷️ Mark for future retry
            });
            return true; // Fallback applied
          }
          
        } catch (error) {
          console.warn(`⚠️ WebP check error for ${photo.id}:`, error);
          
          // Re-queue on error if under max attempts
          if (attempts + 1 < maxAttempts) {
            queue.queue.push({ photo, attempts: attempts + 1 });
          }
          return false;
        } finally {
          // 🔓 Always unlock the photo when done
          queue.activeChecks.delete(photo.id);
        }
      });
      
      await Promise.all(batchPromises);
      
      // Wait between batches to prevent overwhelming Cloud Functions
      if (queue.queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 3000)); // 🚀 3s between batches (reduced from 8s)
      }
    }
    
    queue.processing = false;
    console.log(`✅ WebP queue processing complete`);
  };

  // 🔄 Manual refresh of WebP URLs for an album
  const refreshWebPUrls = async (albumId: string) => {
    const album = albums.find(a => a.id === albumId);
    if (!album) return;
    
    console.log(`🔄 Manual WebP refresh for album ${albumId} (${album.photos.length} photos)`);
    
    // Add all photos to queue for immediate checking
    album.photos.forEach(photo => {
      addToWebPQueue(photo);
    });
    
    console.log(`✅ Added ${album.photos.length} photos to WebP queue for refresh`);
  };

  const deletePhotosFromAlbum = async (albumId: string, photoIds: string[]) => {
    const photosToDelete: Photo[] = [];
    const idSet = new Set(photoIds);

    let finalAlbums: Album[] = [];
    
    setAlbums(prevAlbums => {
      const updatedAlbums = prevAlbums.map(album => {
          if (album.id === albumId) {
              const remainingPhotos = album.photos.filter(p => {
                  if (idSet.has(p.id)) {
                      photosToDelete.push(p);
                      return false;
                  }
                  return true;
              });

              // Check if the cover photo was deleted
              // Compare with all possible URLs since coverPhotoUrl might be any version
              const coverWasDeleted = album.photos.find(p => 
                  (p.optimizedUrl === album.coverPhotoUrl || p.mediumUrl === album.coverPhotoUrl || 
                   p.thumbUrl === album.coverPhotoUrl || p.url === album.coverPhotoUrl) 
                  && idSet.has(p.id)
              );

              let newCoverUrl = album.coverPhotoUrl;
              if (coverWasDeleted) {
                  // Priority: optimizedUrl > mediumUrl > thumbUrl > url
                  newCoverUrl = remainingPhotos.length > 0 
                      ? (remainingPhotos[0].optimizedUrl || remainingPhotos[0].mediumUrl || 
                         remainingPhotos[0].thumbUrl || remainingPhotos[0].url)
                      : 'https://placehold.co/800x600/1a202c/4a5568?text=No+Photos';
              }
              
              return { ...album, photos: remainingPhotos, coverPhotoUrl: newCoverUrl };
          }
          return album;
      });
      
      finalAlbums = updatedAlbums;
      return updatedAlbums;
    });

    // 🔥 Delete files from bucket in parallel
    const deletePromises = photosToDelete
        .filter(photo => photo.path)
        .map(photo => bucketService.deleteFile(photo.path!));
    
    await Promise.all(deletePromises);

    await saveCurrentConfig(finalAlbums, siteSettings);
};

  const updateAlbumPhotos = async (albumId: string, newPhotos: Photo[]) => {
      let finalAlbums: Album[] = [];
      
      setAlbums(prevAlbums => {
          const updatedAlbums = prevAlbums.map(album => {
              if (album.id === albumId) {
                  // Update cover photo to match the first photo in the new order
                  // Priority: optimizedUrl > mediumUrl > thumbUrl > url
                  const newCoverUrl = newPhotos.length > 0 
                      ? (newPhotos[0].optimizedUrl || newPhotos[0].mediumUrl || 
                         newPhotos[0].thumbUrl || newPhotos[0].url)
                      : 'https://placehold.co/800x600/1a202c/4a5568?text=No+Photos';
                      
                  return { ...album, photos: newPhotos, coverPhotoUrl: newCoverUrl };
              }
              return album;
          });
          finalAlbums = updatedAlbums;
          return updatedAlbums;
      });
      
      await saveCurrentConfig(finalAlbums, siteSettings);
  };


  const updateSiteSettings = async (newSettings: Partial<SiteSettings>, newLogoFile?: File) => {
    let updatedSettings = { 
        ...siteSettings, 
        ...newSettings,
        // Deep merge SEO settings
        seo: {
            ...siteSettings.seo,
            ...newSettings.seo,
        }
    };

    if (newLogoFile) {
      // Delete old logo if it exists
      if (siteSettings.logoPath) {
        await bucketService.deleteFile(siteSettings.logoPath);
      }
      const { path, url } = await bucketService.uploadFile(newLogoFile);
      updatedSettings.logoUrl = url;
      updatedSettings.logoPath = path;
    } else if (newSettings.logoUrl === null && siteSettings.logoPath) {
        // Handle logo removal
        await bucketService.deleteFile(siteSettings.logoPath);
        updatedSettings.logoPath = undefined;
    }


    setSiteSettings(updatedSettings);
    await saveCurrentConfig(albums, updatedSettings);
  };
  
  const getSeoSuggestions = async (): Promise<SeoSettings> => {
      const albumTitles = albums.map(a => a.title);
      
      // Only generate if AI is enabled and API key is provided
      if (!siteSettings.aiEnabled || !siteSettings.geminiApiKey) {
        return {
          metaTitle: 'AI features disabled',
          metaDescription: 'Please enable AI features and provide an API key in Settings',
          metaKeywords: '',
          structuredData: ''
        };
      }
      
      return await generateSeoSuggestions(siteSettings.appName, albumTitles, siteSettings.geminiApiKey);
  };

  const searchPhotos = async (albumId: string, query: string): Promise<string[]> => {
    const album = getAlbumById(albumId);
    if (!album || !album.photos) {
        return [];
    }
    
    // Return empty if AI is not enabled or no API key
    if (!siteSettings.aiEnabled || !siteSettings.geminiApiKey) {
      return [];
    }
    
    const photoInfo = album.photos.map(p => ({ id: p.id, title: p.title, description: p.description }));
    const matchingIds = await searchPhotosInAlbum(query, photoInfo, siteSettings.geminiApiKey);
    return matchingIds;
  };

  const saveBatchPhotos = async (albumId: string, photos: Photo[]) => {
    console.log(`💾 Adding ${photos.length} photos to album ${albumId}...`);
    
    // 🔥 ONE SINGLE state update for all photos
    let finalAlbums: Album[] = [];
    
    setAlbums(prevAlbums => {
      const updatedAlbums = prevAlbums.map(album => {
        if (album.id === albumId) {
          const updatedPhotos = [...album.photos, ...photos];
          
          // Update cover photo if this is the first batch and album was empty
          let newCoverUrl = album.coverPhotoUrl;
          if (album.photos.length === 0 && photos.length > 0) {
            const firstPhoto = photos[0];
            newCoverUrl = firstPhoto.optimizedUrl || firstPhoto.mediumUrl || firstPhoto.thumbUrl || firstPhoto.url;
          }
          
          return { ...album, photos: updatedPhotos, coverPhotoUrl: newCoverUrl };
        }
        return album;
      });
      
      finalAlbums = updatedAlbums;
      return updatedAlbums;
    });
    
    // 🔥 ONE SINGLE Firestore write for all photos
    await saveCurrentConfig(finalAlbums, siteSettings);
    console.log(`✅ Batch saved ${photos.length} photos successfully`);
    
    // 🚦 Add photos to WebP check queue (prevents timer overload)
    console.log(`🚦 Adding ${photos.length} photos to WebP queue...`);
    
    // Add to queue with shorter initial delay
    setTimeout(() => {
      photos.forEach(photo => {
        addToWebPQueue(photo);
      });
    }, 3000); // 3s initial delay (reduced from 5s)
  };

  const recoverFromStorage = async () => {
    try {
      console.log('🔄 Starting recovery from Firebase Storage...');
      
      // List all files in uploads folder
      const uploadsRef = ref(storage, 'uploads/');
      const result = await listAll(uploadsRef);
      
      console.log(`📁 Found ${result.items.length} files in Storage`);
      
      // Group files by base name (original files only, not thumbnails)
      const originalFiles = result.items.filter(item => 
        !item.name.includes('_thumb_') && 
        !item.name.includes('_optimized')
      );
      
      console.log(`📸 Found ${originalFiles.length} original photos`);
      
      if (originalFiles.length === 0) {
        console.log('❌ No photos found to recover');
        return;
      }
      
      // Create a recovery album with all photos
      const recoveryAlbumId = `recovery-${Date.now()}`;
      const recoveredPhotos: Photo[] = [];
      
      // Process files in batches to avoid overwhelming the system
      const batchSize = 20;
      for (let i = 0; i < originalFiles.length; i += batchSize) {
        const batch = originalFiles.slice(i, i + batchSize);
        console.log(`🔄 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(originalFiles.length/batchSize)}`);
        
        const batchPromises = batch.map(async (item) => {
          try {
            const url = await getDownloadURL(item);
            const fileName = item.name;
            const baseFileName = fileName.split('/').pop()!;
            
            // Try to get optimized and thumbnail URLs
            const baseName = baseFileName.replace(/\.[^.]+$/, '');
            let optimizedUrl, thumbUrl, mediumUrl;
            
            try {
              optimizedUrl = await getDownloadURL(ref(storage, `uploads/${baseName}_optimized.webp`));
            } catch (e) { /* Optimized not found */ }
            
            try {
              thumbUrl = await getDownloadURL(ref(storage, `uploads/${baseName}_thumb_200.webp`));
            } catch (e) { /* Thumb not found */ }
            
            try {
              mediumUrl = await getDownloadURL(ref(storage, `uploads/${baseName}_thumb_800.webp`));
            } catch (e) { /* Medium not found */ }
            
            const photo: Photo = {
              id: `recovered-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              url,
              optimizedUrl,
              thumbUrl,
              mediumUrl,
              path: item.fullPath,
              title: baseFileName.replace(/^\d+-[a-f0-9]+-/, '').replace(/\.[^.]+$/, ''), // Clean filename
              description: ''
            };
            
            return photo;
          } catch (error) {
            console.error(`❌ Error processing ${item.name}:`, error);
            return null;
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        const validPhotos = batchResults.filter(photo => photo !== null) as Photo[];
        recoveredPhotos.push(...validPhotos);
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log(`✅ Recovered ${recoveredPhotos.length} photos`);
      
      // Create recovery album
      const recoveryAlbum: Album = {
        id: recoveryAlbumId,
        title: `🔄 Recovered Photos (${new Date().toLocaleDateString()})`,
        coverPhotoUrl: recoveredPhotos[0]?.optimizedUrl || recoveredPhotos[0]?.thumbUrl || recoveredPhotos[0]?.url || 'https://placehold.co/800x600/1a202c/4a5568?text=No+Photos',
        photos: recoveredPhotos
      };
      
      // Add to albums
      setAlbums(prevAlbums => [...prevAlbums, recoveryAlbum]);
      
      // Save to Firestore
      const updatedConfig = {
        albums: [...albums, recoveryAlbum],
        siteSettings
      };
      
      await bucketService.saveConfig(updatedConfig);
      
      console.log(`🎉 Recovery complete! Created album "${recoveryAlbum.title}" with ${recoveredPhotos.length} photos`);
      
    } catch (error) {
      console.error('❌ Recovery failed:', error);
      throw error;
    }
  };

  const resetToDefaults = async () => {
    try {
      console.log('🔄 Resetting to default configuration...');
      
      // Get fresh default configuration
      const defaultConfig = await bucketService.getConfig();
      
      // Reset state to defaults (this will trigger a re-render)
      setAlbums(defaultConfig.albums);
      setSiteSettings(defaultConfig.siteSettings);
      
      console.log('✅ Reset to defaults completed');
      
    } catch (error) {
      console.error('❌ Reset to defaults failed:', error);
      throw error;
    }
  };

  return (
    <AppContext.Provider value={{
      albums,
      siteSettings,
      loading,
      addAlbum,
      updateAlbum,
      deleteAlbum,
      addPhotoToAlbum,
      uploadPhotoOnly,
      updatePhotoUrls,
      checkWebPGeneration,
      refreshWebPUrls,
      deletePhotosFromAlbum,
      updateAlbumPhotos,
      updateSiteSettings,
      getAlbumById,
      getSeoSuggestions,
      searchPhotos,
      saveBatchPhotos,
      recoverFromStorage,
      resetToDefaults
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};