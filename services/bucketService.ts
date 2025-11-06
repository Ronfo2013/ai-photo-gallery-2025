import { Album, SiteSettings } from '../types';
import { db, storage } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// --- Firestore Document Path ---
// Firestore path: collection(gallery) / document(config)
const CONFIG_COLLECTION = 'gallery';
const CONFIG_DOCUMENT = 'config';

// --- Helper Functions ---

const generateInitialData = (): { albums: Album[], siteSettings: SiteSettings } => {
    return {
        albums: [
            {
              id: 'album-1',
              title: 'Album di Esempio',
              coverPhotoUrl: 'https://placehold.co/800x600/1a202c/4a5568?text=No+Photos', // Consistent placeholder
              photos: [],
            },
        ],
        siteSettings: {
            appName: 'AI Photo Gallery',
            logoUrl: null,
            footerText: '© 2024 AI Photo Gallery. All Rights Reserved.',
            navLinks: [
                { id: 'nav-1', text: 'Gallery', to: '/' }
            ],
            gtmId: '',
            siteUrl: '', // Custom site URL for sharing (empty = use Cloud Run URL)
            seo: {
                metaTitle: 'AI Photo Gallery',
                metaDescription: 'Discover stunning photo collections in the AI-powered gallery.',
                metaKeywords: 'photo gallery, ai, photography, landscapes, city life',
                structuredData: '',
            },
            aiEnabled: false, // AI features disabled by default
            geminiApiKey: '', // Empty API key by default
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
        }
    }
}

// --- Public API ---

type AppConfig = {
    albums: Album[];
    siteSettings: SiteSettings;
}

const performMigration = (config: any): AppConfig => {
    const defaults = generateInitialData();
    // Site settings migration
    if (!config.siteSettings) {
        config.siteSettings = defaults.siteSettings;
    } else {
        // Migrate all existing and new fields with proper defaults
        config.siteSettings.appName = config.siteSettings.appName || defaults.siteSettings.appName;
        config.siteSettings.logoUrl = config.siteSettings.logoUrl !== undefined ? config.siteSettings.logoUrl : defaults.siteSettings.logoUrl;
        config.siteSettings.footerText = config.siteSettings.footerText || defaults.siteSettings.footerText;
        config.siteSettings.navLinks = config.siteSettings.navLinks || defaults.siteSettings.navLinks;
        config.siteSettings.gtmId = config.siteSettings.gtmId || defaults.siteSettings.gtmId;
        config.siteSettings.seo = config.siteSettings.seo || defaults.siteSettings.seo;
        
        // New AI-related fields (added later, need migration)
        config.siteSettings.aiEnabled = config.siteSettings.aiEnabled !== undefined ? config.siteSettings.aiEnabled : defaults.siteSettings.aiEnabled;
        config.siteSettings.geminiApiKey = config.siteSettings.geminiApiKey || defaults.siteSettings.geminiApiKey;
        
        // New URL and preloader fields (migration)
        config.siteSettings.siteUrl = config.siteSettings.siteUrl !== undefined ? config.siteSettings.siteUrl : defaults.siteSettings.siteUrl;
        config.siteSettings.preloader = config.siteSettings.preloader || defaults.siteSettings.preloader;
    }
    return config as AppConfig;
}

/**
 * Get configuration from Firestore
 */
export const getConfig = async (): Promise<AppConfig> => {
    try {
        const docRef = doc(db, CONFIG_COLLECTION, CONFIG_DOCUMENT);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const config = docSnap.data() as AppConfig;
            return performMigration(config);
        } else {
            // If no config exists, create and save the initial one
            const initialConfig = generateInitialData();
            await saveConfig(initialConfig);
            return initialConfig;
        }
    } catch (error) {
        console.error("Error getting config from Firestore:", error);
        // Fallback to initial data if Firestore fails
        return generateInitialData();
    }
};

/**
 * Save configuration to Firestore
 */
// 🧹 Remove undefined values from objects (Firestore doesn't accept undefined)
const sanitizeForFirestore = (obj: any): any => {
    if (obj === null || obj === undefined) {
        return null;
    }
    
    if (Array.isArray(obj)) {
        return obj.map(sanitizeForFirestore);
    }
    
    if (typeof obj === 'object') {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(obj)) {
            if (value !== undefined) {
                sanitized[key] = sanitizeForFirestore(value);
            }
        }
        return sanitized;
    }
    
    return obj;
};

export const saveConfig = async (config: AppConfig): Promise<void> => {
    try {
        // 🧹 Sanitize config to remove undefined values
        const sanitizedConfig = sanitizeForFirestore(config);
        
        const docRef = doc(db, CONFIG_COLLECTION, CONFIG_DOCUMENT);
        await setDoc(docRef, sanitizedConfig);
        console.log("Config saved to Firestore successfully");
        
        // Trigger cache clear event
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'CLEAR_CACHE'
            });
        }
    } catch (error) {
        console.error("Error saving config to Firestore:", error);
        throw error;
    }
};

/**
 * Upload file to Cloud Storage
 * Returns URLs for original and processed versions (processed by Cloud Function)
 * 
 * OPTIMIZATION: No client-side conversion - uploads original directly
 * Cloud Function will handle WebP conversion and thumbnail generation
 */
export const uploadFile = async (file: File): Promise<{ 
    path: string, 
    url: string,
    optimizedUrl?: string,
    thumbUrl?: string,
    mediumUrl?: string
}> => {
    try {
        // Sanitize filename to prevent issues
        const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '') || 'file';
        
        // Generate unique path with UUID to prevent collisions
        const uniqueId = crypto.randomUUID().slice(0, 8);
        const path = `uploads/${Date.now()}-${uniqueId}-${safeName}`;
        
        // Create a reference to the file location
        const storageRef = ref(storage, path);
        
        // Upload original file directly (no conversion)
        console.log(`⬆️ Uploading ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)...`);
        await uploadBytes(storageRef, file);
        
        // Get the download URL
        const url = await getDownloadURL(storageRef);
        
        console.log(`✅ Upload complete: ${path}`);
        
        // Return immediately with original URL
        // Cloud Function will generate optimized versions asynchronously
        // Frontend will use original as fallback until optimized versions are ready
        return { 
            path, 
            url,
            optimizedUrl: undefined, // Will be generated by Cloud Function
            thumbUrl: undefined,     // Will be generated by Cloud Function
            mediumUrl: undefined     // Will be generated by Cloud Function
        };
    } catch (error) {
        console.error("❌ Error uploading file:", error);
        throw error;
    }
};

/**
 * Delete file from Cloud Storage (including all processed versions)
 */
export const deleteFile = async (path: string): Promise<void> => {
    try {
        // Delete the original file
        const storageRef = ref(storage, path);
        await deleteObject(storageRef);
        console.log(`🗑️ Deleted original: ${path}`);
        
        // Delete all processed versions
        const baseFileName = path.split('/').pop()!;
        const processedFiles = [
            path.replace(baseFileName, baseFileName.replace(/\.[^.]+$/, '_optimized.webp')),
            path.replace(baseFileName, baseFileName.replace(/\.[^.]+$/, '_thumb_200.webp')),
            path.replace(baseFileName, baseFileName.replace(/\.[^.]+$/, '_thumb_800.webp'))
        ];
        
        // 🔥 Delete all processed files in parallel
        const deletePromises = processedFiles.map(async (filePath) => {
            try {
                await deleteObject(ref(storage, filePath));
                console.log(`🗑️ Deleted: ${filePath}`);
            } catch (error) {
                // Ignore if file doesn't exist (might not be generated yet)
                if ((error as any).code !== 'storage/object-not-found') {
                    console.warn(`⚠️ Could not delete ${filePath}:`, error);
                }
            }
        });
        
        await Promise.all(deletePromises);
    } catch (error) {
        console.error("❌ Error deleting file:", error);
        // Don't throw error if file doesn't exist
        if ((error as any).code !== 'storage/object-not-found') {
            throw error;
        }
    }
};
