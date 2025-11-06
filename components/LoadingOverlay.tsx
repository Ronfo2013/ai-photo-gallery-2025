import React from 'react';
import Spinner from './Spinner';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  size?: 'small' | 'medium' | 'large';
  overlay?: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isLoading, 
  message = 'Loading...', 
  size = 'medium',
  overlay = false 
}) => {
  if (!isLoading) return null;

  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8', 
    large: 'h-12 w-12'
  };

  const content = (
    <div className="flex flex-col items-center gap-3">
      <Spinner size={sizeClasses[size]} />
      <span className="text-sm text-gray-300 animate-pulse">{message}</span>
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
        <div className="bg-gray-800 p-6 rounded-lg shadow-2xl border border-gray-700">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      {content}
    </div>
  );
};

export default LoadingOverlay;


