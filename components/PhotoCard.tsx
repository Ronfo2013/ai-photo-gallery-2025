
import React, { useState } from 'react';
import { Photo } from '../types';

interface PhotoCardProps {
  photo: Photo;
  onClick: () => void;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onClick }) => {
  // 🚀 SMART LOADING: Never load heavy JPG in grid view!
  // Priority: thumbUrl > optimizedUrl > placeholder (NO original URL!)
  const getInitialImageSrc = () => {
    // Only use WebP versions, never original JPG in grid
    return photo.thumbUrl || photo.optimizedUrl || null;
  };
  
  const [imageSrc, setImageSrc] = useState(getInitialImageSrc());
  const [fallbackLevel, setFallbackLevel] = useState(0);
  const [showPlaceholder, setShowPlaceholder] = useState(!getInitialImageSrc());

  // 🔄 Update image when WebP becomes available
  React.useEffect(() => {
    const newSrc = getInitialImageSrc();
    if (newSrc && newSrc !== imageSrc) {
      console.log(`🎉 WebP ready for ${photo.id}, updating image`);
      setImageSrc(newSrc);
      setShowPlaceholder(false);
      setFallbackLevel(0);
    }
  }, [photo.thumbUrl, photo.optimizedUrl]);
  
  // Handle image load error - try WebP fallback or show placeholder
  const handleImageError = () => {
    if (fallbackLevel === 0 && photo.thumbUrl && imageSrc === photo.thumbUrl) {
      console.log(`⚠️ Thumbnail failed for ${photo.id}, trying optimized WebP`);
      if (photo.optimizedUrl) {
        setImageSrc(photo.optimizedUrl);
        setFallbackLevel(1);
      } else {
        // No WebP available, show placeholder
        setShowPlaceholder(true);
        setImageSrc(null);
      }
    } else if (fallbackLevel === 1 && photo.optimizedUrl && imageSrc === photo.optimizedUrl) {
      console.log(`⚠️ Optimized WebP failed for ${photo.id}, showing placeholder`);
      // Don't load original JPG! Show placeholder instead
      setShowPlaceholder(true);
      setImageSrc(null);
    }
  };
  
  return (
    <div onClick={onClick} className="group cursor-pointer block overflow-hidden rounded-lg shadow-lg relative">
      {showPlaceholder || !imageSrc ? (
        // 🖼️ Placeholder when WebP not ready (never load heavy JPG!)
        <div className="w-full aspect-square bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="text-3xl mb-2">📸</div>
            <div className="text-xs">Optimizing...</div>
          </div>
        </div>
      ) : (
        <img
          src={imageSrc}
          alt={photo.title || "Photo"}
          loading="lazy"
          onError={handleImageError}
          className="w-full h-full object-cover aspect-square transition-transform duration-500 ease-in-out group-hover:scale-110"
        />
      )}
      
      {/* Only show title overlay if title exists */}
      {photo.title && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <h3 className="text-white font-semibold text-lg drop-shadow-md">{photo.title}</h3>
        </div>
      )}
    </div>
  );
};

export default PhotoCard;
