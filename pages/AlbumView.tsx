import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Album, Photo } from '../types';
import PhotoCard from '../components/PhotoCard';
import Modal from '../components/Modal';
import PhotoCardSkeleton from '../components/PhotoCardSkeleton';
import AlbumMetaTags from '../components/AlbumMetaTags';

const AlbumView: React.FC = () => {
  const { albumId } = useParams<{ albumId: string }>();
  const { getAlbumById, loading, siteSettings } = useAppContext();
  const [album, setAlbum] = useState<Album | undefined>(undefined);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());

  useEffect(() => {
    if (!loading && albumId) {
      const foundAlbum = getAlbumById(albumId);
      setAlbum(foundAlbum);
    }
  }, [albumId, getAlbumById, loading]);

  const photosToDisplay = album?.photos || [];
  
  const selectedPhoto = selectedPhotoIndex !== null ? photosToDisplay[selectedPhotoIndex] : null;

  // Preload images function
  const preloadImage = useCallback((photo: Photo) => {
    const imageUrl = photo.mediumUrl || photo.url;
    if (!imageCache.current.has(imageUrl)) {
      const img = new Image();
      img.src = imageUrl;
      imageCache.current.set(imageUrl, img);
    }
  }, []);

  // Preload adjacent images when modal opens or index changes
  useEffect(() => {
    if (selectedPhotoIndex !== null && photosToDisplay.length > 0) {
      // Preload current image
      preloadImage(photosToDisplay[selectedPhotoIndex]);
      
      // Preload next image
      if (selectedPhotoIndex < photosToDisplay.length - 1) {
        preloadImage(photosToDisplay[selectedPhotoIndex + 1]);
      }
      
      // Preload previous image
      if (selectedPhotoIndex > 0) {
        preloadImage(photosToDisplay[selectedPhotoIndex - 1]);
      }
    }
  }, [selectedPhotoIndex, photosToDisplay, preloadImage]);

  const handlePhotoClick = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  const closeModal = () => {
    setSelectedPhotoIndex(null);
    setIsTransitioning(false);
    setSlideDirection(null);
  };

  // Touch/swipe support
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNextPhoto();
    } else if (isRightSwipe) {
      handlePrevPhoto();
    }
  };

  const handleNextPhoto = useCallback(() => {
    if (isTransitioning || selectedPhotoIndex === null || selectedPhotoIndex >= photosToDisplay.length - 1) {
      return;
    }
    
    setIsTransitioning(true);
    setSlideDirection('left');
    
    setTimeout(() => {
      setSelectedPhotoIndex(prevIndex => (prevIndex !== null ? prevIndex + 1 : 0));
      setSlideDirection(null);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 150);
  }, [photosToDisplay.length, selectedPhotoIndex, isTransitioning]);

  const handlePrevPhoto = useCallback(() => {
    if (isTransitioning || selectedPhotoIndex === null || selectedPhotoIndex <= 0) {
      return;
    }
    
    setIsTransitioning(true);
    setSlideDirection('right');
    
    setTimeout(() => {
      setSelectedPhotoIndex(prevIndex => (prevIndex !== null ? prevIndex - 1 : 0));
      setSlideDirection(null);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 150);
  }, [selectedPhotoIndex, isTransitioning]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPhotoIndex === null) return;
      if (e.key === 'ArrowRight') {
        handleNextPhoto();
      } else if (e.key === 'ArrowLeft') {
        handlePrevPhoto();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedPhotoIndex, handleNextPhoto, handlePrevPhoto]);


  if (loading) {
    return (
      <div>
        <div className="mb-8">
            <div className="h-10 bg-gray-700 rounded w-1/2 mx-auto animate-pulse mb-2"></div>
            <div className="h-5 bg-gray-700 rounded w-1/4 mx-auto animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {Array.from({ length: 10 }).map((_, index) => (
            <PhotoCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold mb-4">Album not found</h2>
        <p className="mb-4 text-gray-400">The album you are looking for does not exist.</p>
        <Link to="/" className="text-teal-400 hover:text-teal-300">
          &larr; Back to Gallery
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Meta tags per condivisione social */}
      {album && <AlbumMetaTags album={album} siteSettings={siteSettings} />}
      
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-teal-300">{album.title}</h1>
        <p className="text-gray-400 mt-2">{album.photos.length} photos in this album.</p>
      </div>
      
      {photosToDisplay.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {photosToDisplay.map((photo, index) => (
            <div
              key={photo.id}
              className="animate-slide-in-up"
              style={{ animationDelay: `${index * 50}ms`, opacity: 0 }}
            >
              <PhotoCard photo={photo} onClick={() => handlePhotoClick(index)} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
            <p className="text-gray-400">This album is empty.</p>
            <Link to="/admin" className="mt-4 inline-block text-teal-400 hover:text-teal-300">
                Upload photos &rarr;
            </Link>
        </div>
      )}

      {selectedPhoto && (
        <Modal isOpen={selectedPhotoIndex !== null} onClose={closeModal}>
           <div className="relative flex items-center justify-center bg-black rounded-lg overflow-hidden">
            <div 
              className="relative w-full h-full flex items-center justify-center"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                key={selectedPhoto.id}
                src={selectedPhoto.mediumUrl || selectedPhoto.url}
                alt={selectedPhoto.title}
                loading="lazy"
                className={`max-w-full max-h-[85vh] object-contain transition-all duration-300 ease-out ${
                  isTransitioning 
                    ? slideDirection === 'left' 
                      ? 'transform translate-x-full opacity-0' 
                      : slideDirection === 'right'
                      ? 'transform -translate-x-full opacity-0'
                      : 'transform translate-x-0 opacity-100'
                    : 'transform translate-x-0 opacity-100'
                }`}
                style={{
                  filter: isTransitioning ? 'blur(1px)' : 'blur(0px)',
                }}
              />
            </div>
            
            <button
                onClick={(e) => { e.stopPropagation(); handlePrevPhoto(); }}
                disabled={selectedPhotoIndex === 0 || isTransitioning}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 sm:p-3 hover:bg-black/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-20 disabled:cursor-not-allowed hover:scale-110"
                aria-label="Previous photo"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>

            <button
                onClick={(e) => { e.stopPropagation(); handleNextPhoto(); }}
                disabled={selectedPhotoIndex === photosToDisplay.length - 1 || isTransitioning}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 sm:p-3 hover:bg-black/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-20 disabled:cursor-not-allowed hover:scale-110"
                aria-label="Next photo"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>

            {/* Photo counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
              {selectedPhotoIndex !== null ? selectedPhotoIndex + 1 : 0} / {photosToDisplay.length}
            </div>

           </div>
        </Modal>
      )}
    </div>
  );
};

export default AlbumView;