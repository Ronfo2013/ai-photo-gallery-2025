
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Album } from '../types';
import { getShareUrl } from '../utils/urlUtils';

interface AlbumCardProps {
  album: Album;
}

const AlbumCard: React.FC<AlbumCardProps> = ({ album }) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const shareUrl = getShareUrl(album.id);

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowShareMenu(!showShareMenu);
  };

  const copyToClipboard = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
        setShowShareMenu(false);
      }, 2000);
    } catch (err) {
      // Fallback per browser più vecchi
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
        setShowShareMenu(false);
      }, 2000);
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-lg shadow-lg bg-gray-800 hover:shadow-2xl transition-all duration-300 hover:scale-105">
      <Link to={`/album/${album.id}`} className="block">
        <div className="aspect-square relative overflow-hidden">
          <img
            src={album.coverPhotoUrl}
            alt={album.title}
            loading="lazy"
            className="w-full h-full object-cover aspect-square transition-transform duration-500 ease-in-out group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 p-4 md:p-6">
            <h3 className="text-xl md:text-2xl font-bold text-white">{album.title}</h3>
            <p className="text-sm text-gray-300 mt-1">{album.photos.length} photos</p>
          </div>
        </div>
      </Link>
      
      {/* Share Button */}
      <button
        onClick={handleShare}
        className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-80 hover:opacity-100 transition-all duration-200 hover:scale-110 z-10"
        title="Condividi album"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
        </svg>
      </button>

      {/* Share Menu */}
      {showShareMenu && (
        <div className="absolute top-12 right-3 bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-3 z-20 min-w-[250px]">
          <p className="text-gray-300 text-sm mb-2">Condividi questo album:</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-gray-300"
            />
            <button
              onClick={copyToClipboard}
              className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded text-sm transition-colors whitespace-nowrap"
            >
              {copySuccess ? '✓ Copiato' : 'Copia'}
            </button>
          </div>
          {copySuccess && (
            <p className="text-teal-400 text-xs mt-1">Link copiato negli appunti!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AlbumCard;
