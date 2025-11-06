import React from 'react';

interface PreloaderProps {
  appName?: string;
  logoUrl?: string | null;
}

const Preloader: React.FC<PreloaderProps> = ({ 
  appName = 'AI Photo Gallery', 
  logoUrl = null 
}) => {
  
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center z-[100] animate-fade-in">
      {/* Logo principale */}
      <div className="mb-6">
        {logoUrl ? (
          <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center animate-pulse">
            <img 
              src={logoUrl} 
              alt={appName} 
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                // Fallback to default icon if logo fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.style.display = 'none'; // Hide completely if logo fails
                }
              }}
            />
          </div>
        ) : (
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center animate-pulse shadow-lg shadow-teal-500/30">
            {/* No letter - clean icon */}
          </div>
        )}
      </div>
      
      {/* Nome app e spinner */}
      <div className="flex flex-col items-center gap-4">
        <span className="text-3xl font-bold text-teal-300 tracking-wider text-shadow-lg">{appName}</span>
        
        {/* Spinner circolare migliorato */}
        <svg
          className="h-12 w-12"
          viewBox="0 0 50 50"
          style={{ transformOrigin: 'center', animation: 'preloader-spin 2s linear infinite' }}
        >
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            strokeWidth="4"
            className="stroke-teal-400"
            style={{
              strokeLinecap: 'round',
              strokeDasharray: '125',
              animation: 'preloader-draw 1.5s ease-in-out infinite',
            }}
          />
        </svg>
      </div>
      
      <p className="text-gray-400 mt-4 text-lg">Loading your moments...</p>
      
      {/* Barra di progresso */}
      <div className="w-48 h-1 bg-gray-700 rounded-full mt-4 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};

export default Preloader;