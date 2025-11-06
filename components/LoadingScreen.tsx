import React from 'react';
import { useAppContext } from '../context/AppContext';

const LoadingScreen: React.FC = () => {
  const { siteSettings } = useAppContext();

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Logo con stile identico al placeholder */}
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center animate-pulse shadow-lg shadow-teal-500/30">
          <span className="text-3xl">📸</span>
        </div>
        
        {/* Nome app */}
        <h2 className="text-2xl font-bold text-teal-300 mb-4 text-shadow-lg">
          {siteSettings.appName || 'AI Photo Gallery'}
        </h2>
        
        {/* Spinner */}
        <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        
        {/* Messaggio */}
        <p className="text-gray-400 text-lg">Loading your gallery...</p>
        
        {/* Barra di progresso animata */}
        <div className="w-48 h-1 bg-gray-700 rounded-full mx-auto mt-4 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
