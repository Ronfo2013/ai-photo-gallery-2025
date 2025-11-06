import React, { useState, useRef, useEffect } from 'react';
import { Album, Photo } from '../types';
import { useAppContext } from '../context/AppContext';
import Spinner from './Spinner';
import LoadingOverlay from './LoadingOverlay';

interface AlbumPhotoManagerProps {
  album: Album;
}

type UploadStatus = 'idle' | 'generating' | 'uploading' | 'success' | 'error';
interface FileToUpload {
  id: string;
  file: File;
  title: string;
  status: UploadStatus;
  message: string;
}

const AlbumPhotoManager: React.FC<AlbumPhotoManagerProps> = ({ album }) => {
  const { addPhotoToAlbum, uploadPhotoOnly, deletePhotosFromAlbum, updateAlbumPhotos, saveBatchPhotos } = useAppContext();

  // Upload state
  const [filesToUpload, setFilesToUpload] = useState<FileToUpload[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Management state
  const [orderedPhotos, setOrderedPhotos] = useState<Photo[]>(album.photos);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(new Set());
  const [isOrderDirty, setIsOrderDirty] = useState(false);
  
  // UI feedback state
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [draggedPhotoId, setDraggedPhotoId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  // Sync photos when album prop changes, but only if there are no unsaved ordering changes.
  useEffect(() => {
    if (!isOrderDirty) {
      setOrderedPhotos(album.photos);
    }
  }, [album.photos, isOrderDirty]);


  // --- UPLOAD LOGIC ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        id: `file-${Math.random()}`,
        file,
        title: "", // Empty title - no automatic name from filename
        status: 'idle' as UploadStatus,
        message: 'Waiting to upload...'
      }));
      setFilesToUpload(prev => [...prev, ...newFiles]);
    }
  };

  const updateFileStatus = (id: string, status: UploadStatus, message: string) => {
    setFilesToUpload(prev => prev.map(f => f.id === id ? { ...f, status, message } : f));
  };

  const [isUploadingBatch, setIsUploadingBatch] = useState(false);

  const handleUploadAll = async () => {
    // Filter files that need uploading
    const filesToProcess = filesToUpload.filter(
      file => file.status === 'idle' || file.status === 'error'
    );
    
    if (filesToProcess.length === 0) return;
    
    setIsUploadingBatch(true);
    console.log(`🚀 Starting parallel upload of ${filesToProcess.length} files...`);
    
    try {
      const uploadedPhotos: any[] = [];
      
      // 🚀 SUPER FAST PARALLEL UPLOAD - NO state updates during upload!
      const uploadPromises = filesToProcess.map(async (file) => {
        try {
          updateFileStatus(file.id, 'uploading', '⬆️ Uploading...');
          
          // 🔥 Use uploadPhotoOnly - NO state updates, just upload!
          const photo = await uploadPhotoOnly(file.file, file.title);
          uploadedPhotos.push(photo);
          
          updateFileStatus(file.id, 'success', '✅ Uploaded! Saving batch...');
        } catch (error) {
          console.error(`❌ Upload failed for ${file.file.name}:`, error);
          const errorMessage = error instanceof Error ? error.message : 'Upload failed';
          updateFileStatus(file.id, 'error', errorMessage);
        }
      });
      
      // Wait for all uploads to complete
      await Promise.all(uploadPromises);
      
      // 🔥 ONE SINGLE Firestore save for all photos
      if (uploadedPhotos.length > 0) {
        console.log(`💾 Saving batch of ${uploadedPhotos.length} photos to Firestore...`);
        await saveBatchPhotos(album.id, uploadedPhotos);
        
        // Update all successful files status
        filesToProcess.forEach(file => {
          if (file.status !== 'error') {
            updateFileStatus(file.id, 'success', '✅ Uploaded! Server optimizing...');
          }
        });
      }
      
      console.log('🎉 All uploads completed!');
    } finally {
      setIsUploadingBatch(false);
    }
  };


  // --- MANAGEMENT LOGIC (DELETE, REORDER) ---
  const handlePhotoSelection = (photoId: string) => {
    setSelectedPhotoIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(photoId)) {
            newSet.delete(photoId);
        } else {
            newSet.add(photoId);
        }
        return newSet;
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedPhotoIds.size === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedPhotoIds.size} selected photo(s)?`)) {
        setIsDeleting(true);
        try {
            await deletePhotosFromAlbum(album.id, Array.from(selectedPhotoIds));
            setSelectedPhotoIds(new Set());
        } finally {
            setIsDeleting(false);
        }
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, photoId: string) => {
    setDraggedPhotoId(photoId);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragEnd = () => {
    setDraggedPhotoId(null);
    setDropTargetId(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    if (targetId !== dropTargetId) {
        setDropTargetId(targetId);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetPhotoId: string) => {
    if (!draggedPhotoId || draggedPhotoId === targetPhotoId) return;
    
    const draggedIndex = orderedPhotos.findIndex(p => p.id === draggedPhotoId);
    const targetIndex = orderedPhotos.findIndex(p => p.id === targetPhotoId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newPhotos = [...orderedPhotos];
    const [draggedItem] = newPhotos.splice(draggedIndex, 1);
    newPhotos.splice(targetIndex, 0, draggedItem);
    
    setOrderedPhotos(newPhotos);
    setIsOrderDirty(true);
  };
  
  const handleSaveOrder = async () => {
    setIsSavingOrder(true);
    try {
        await updateAlbumPhotos(album.id, orderedPhotos);
        setIsOrderDirty(false);
    } finally {
        setIsSavingOrder(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-700 space-y-6 relative">
      {/* Loading overlays */}
      <LoadingOverlay 
        isLoading={isUploadingBatch} 
        message="Uploading photos..." 
        overlay 
      />
      
      <LoadingOverlay 
        isLoading={isDeleting} 
        message="Deleting photos..." 
        overlay 
      />
      
      {/* Photo Uploader */}
      <div>
        <h4 className="text-md font-semibold text-gray-200 mb-2">Upload New Photos</h4>
        <div className="bg-gray-800 p-4 rounded-md">
           <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/png, image/jpeg"
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-700 transition-colors cursor-pointer"
          />
          {filesToUpload.length > 0 && (
            <div className="mt-4 space-y-3">
              {filesToUpload.map(file => (
                <div key={file.id} className={`p-2 rounded-md flex items-center gap-3 ${file.status === 'success' ? 'bg-green-900/50' : 'bg-gray-700/50'}`}>
                  <span className="text-sm truncate flex-grow">{file.file.name}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    file.status === 'idle' ? 'bg-gray-600' :
                    file.status === 'generating' || file.status === 'uploading' ? 'bg-blue-600 animate-pulse' :
                    file.status === 'success' ? 'bg-green-600' : 'bg-red-600'
                  }`}>{file.message}</span>
                </div>
              ))}
               <button onClick={handleUploadAll} className="w-full mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-md text-white font-semibold transition-colors">
                Upload All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Photo Manager */}
      <div>
        <h4 className="text-md font-semibold text-gray-200 mb-2">Manage Existing Photos</h4>
        <div className="flex justify-end gap-2 mb-2 min-h-[30px]">
            {isOrderDirty && (
                 <button 
                    onClick={handleSaveOrder} 
                    disabled={isSavingOrder}
                    className="inline-flex items-center justify-center px-3 py-1 text-sm bg-green-600 hover:bg-green-700 rounded-md text-white transition-colors disabled:bg-gray-600">
                    {isSavingOrder ? <Spinner size="h-4 w-4"/> : 'Save Order'}
                </button>
            )}
             {selectedPhotoIds.size > 0 && (
                <button 
                    onClick={handleDeleteSelected} 
                    disabled={isDeleting}
                    className="inline-flex items-center justify-center px-3 py-1 text-sm bg-red-600 hover:bg-red-700 rounded-md text-white transition-colors disabled:bg-gray-600">
                    {isDeleting ? <Spinner size="h-4 w-4"/> : `Delete Selected (${selectedPhotoIds.size})`}
                </button>
            )}
        </div>
        {orderedPhotos.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2" onDragLeave={() => setDropTargetId(null)}>
            {orderedPhotos.map(photo => (
              <div 
                key={photo.id}
                draggable
                onDragStart={(e) => handleDragStart(e, photo.id)}
                onDragOver={(e) => handleDragOver(e, photo.id)}
                onDrop={(e) => handleDrop(e, photo.id)}
                onDragEnd={handleDragEnd}
                className={`relative group aspect-square rounded-md overflow-hidden cursor-move transition-all duration-200
                  ${selectedPhotoIds.has(photo.id) ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-teal-500' : ''}
                  ${draggedPhotoId === photo.id ? 'opacity-30 scale-95' : 'opacity-100'}
                  ${dropTargetId === photo.id && dropTargetId !== draggedPhotoId ? 'scale-105 shadow-lg shadow-teal-500/50' : ''}
                `}
              >
                {/* 🚀 SMART LOADING: Only WebP, never heavy JPG in admin grid! */}
                {photo.thumbUrl || photo.optimizedUrl ? (
                  <img 
                    src={photo.thumbUrl || photo.optimizedUrl} 
                    alt={photo.title} 
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      // Only try WebP fallback, never original JPG
                      if (photo.thumbUrl && target.src.includes('_thumb_200')) {
                        console.log(`⚠️ Thumbnail failed for ${photo.id}, trying optimized WebP`);
                        if (photo.optimizedUrl) {
                          target.src = photo.optimizedUrl;
                        } else {
                          // Hide image, show placeholder
                          target.style.display = 'none';
                        }
                      } else {
                        // Hide failed image
                        target.style.display = 'none';
                      }
                    }}
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  // 🖼️ Placeholder when WebP not ready
                  <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <div className="text-lg">📸</div>
                      <div className="text-xs">Processing...</div>
                    </div>
                  </div>
                )}
                <div 
                    className={`absolute inset-0 transition-colors flex items-center justify-center 
                        ${selectedPhotoIds.has(photo.id) ? 'bg-black/50' : 'bg-black/0 group-hover:bg-black/50'}`
                    }
                >
                    <input 
                        type="checkbox"
                        checked={selectedPhotoIds.has(photo.id)}
                        onChange={() => handlePhotoSelection(photo.id)}
                        className="absolute top-2 left-2 h-5 w-5 rounded text-teal-500 bg-gray-700 border-gray-600 focus:ring-teal-500 cursor-pointer transition-opacity opacity-0 group-hover:opacity-100"
                        style={selectedPhotoIds.has(photo.id) ? {opacity: 1} : {}}
                    />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">This album has no photos yet.</p>
        )}
      </div>
    </div>
  );
};

export default AlbumPhotoManager;