import React from 'react';
import { useAppContext } from '../context/AppContext';
import AlbumCard from '../components/AlbumCard';
import AlbumCardSkeleton from '../components/AlbumCardSkeleton';

const AlbumList: React.FC = () => {
  const { albums, loading } = useAppContext();

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center text-teal-300">Photo Albums</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <AlbumCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center text-teal-300">Photo Albums</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {albums.map((album, index) => (
          <div
            key={album.id}
            className="animate-slide-in-up"
            style={{ animationDelay: `${index * 100}ms`, opacity: 0 }}
          >
            <AlbumCard album={album} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlbumList;