import React from 'react';

const AlbumCardSkeleton: React.FC = () => {
  return (
    <div className="group block overflow-hidden rounded-lg shadow-lg relative aspect-square">
      <div className="w-full h-full bg-gray-800 animate-pulse" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 p-4 md:p-6 w-full">
        <div className="h-7 bg-gray-700 rounded w-3/4 animate-pulse mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-1/4 animate-pulse"></div>
      </div>
    </div>
  );
};

export default AlbumCardSkeleton;
