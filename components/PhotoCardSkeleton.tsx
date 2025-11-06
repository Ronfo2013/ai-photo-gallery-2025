import React from 'react';

const PhotoCardSkeleton: React.FC = () => {
  return (
    <div className="block overflow-hidden rounded-lg shadow-lg relative aspect-square">
      <div className="w-full h-full bg-gray-800 animate-pulse" />
    </div>
  );
};

export default PhotoCardSkeleton;
