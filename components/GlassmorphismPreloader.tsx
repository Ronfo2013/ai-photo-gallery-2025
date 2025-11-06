import React from 'react';
import { PreloaderSettings } from '../types';

interface GlassmorphismPreloaderProps {
  appName: string;
  logoUrl: string | null;
  progress: number; // 0-100
  settings: PreloaderSettings;
}

const GlassmorphismPreloader: React.FC<GlassmorphismPreloaderProps> = ({
  appName,
  logoUrl,
  progress,
  settings
}) => {
  const {
    style,
    backgroundColor,
    primaryColor,
    secondaryColor,
    showLogo,
    showProgress,
    customText,
    animationSpeed
  } = settings;

  // Animation speed mapping
  const speedMap = {
    slow: '3s',
    normal: '2s',
    fast: '1s'
  };
  const animSpeed = speedMap[animationSpeed];

  // Render based on style
  const renderPreloader = () => {
    switch (style) {
      case 'glassmorphism':
        return renderGlassmorphism();
      case 'modern':
        return renderModern();
      case 'minimal':
        return renderMinimal();
      case 'elegant':
        return renderElegant();
      default:
        return renderGlassmorphism();
    }
  };

  const renderGlassmorphism = () => (
    <div 
      className="fixed inset-0 flex flex-col items-center justify-center z-[100] overflow-hidden"
      style={{ backgroundColor }}
    >
      {/* Floating glass orbs in background */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full opacity-20 blur-3xl"
          style={{ 
            background: `radial-gradient(circle, ${primaryColor}, transparent)`,
            animation: `float-glass ${animSpeed} ease-in-out infinite`
          }}
        />
        <div 
          className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ 
            background: `radial-gradient(circle, ${secondaryColor}, transparent)`,
            animation: `float-glass ${animSpeed} ease-in-out infinite reverse`
          }}
        />
      </div>

      {/* Glass card container */}
      <div 
        className="relative backdrop-blur-2xl bg-white/10 rounded-3xl p-12 shadow-2xl border border-white/20"
        style={{ animation: `gentle-float ${animSpeed} ease-in-out infinite` }}
      >
        {/* Logo */}
        {showLogo && (
          <div className="mb-8 flex justify-center">
            {logoUrl ? (
              <div className="w-24 h-24 flex items-center justify-center">
                <img 
                  src={logoUrl} 
                  alt={appName}
                  className="max-w-full max-h-full object-contain"
                  style={{ animation: `pulse-glow ${animSpeed} ease-in-out infinite` }}
                />
              </div>
            ) : (
              <div 
                className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl"
                style={{ 
                  background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                  animation: `pulse-glow ${animSpeed} ease-in-out infinite`
                }}
              >
                {/* No letter - clean icon */}
              </div>
            )}
          </div>
        )}

        {/* App name with gradient */}
        <h1 
          className="text-4xl font-bold text-center mb-6 bg-clip-text text-transparent"
          style={{ 
            backgroundImage: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
            backgroundSize: '200% 200%',
            animation: `text-shimmer ${animSpeed} linear infinite`
          }}
        >
          {appName}
        </h1>

        {/* Custom text */}
        {customText && (
          <p 
            className="text-center text-lg mb-8"
            style={{ color: primaryColor }}
          >
            {customText}
          </p>
        )}

        {/* Spinner */}
        <div className="flex justify-center mb-6">
          <div 
            className="w-16 h-16 rounded-full border-4 border-t-transparent"
            style={{ 
              borderColor: `${primaryColor} transparent transparent transparent`,
              animation: `spin-glass ${animSpeed} linear infinite`
            }}
          />
        </div>

        {/* Progress bar */}
        {showProgress && (
          <div className="w-64 mx-auto">
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <div 
                className="h-full rounded-full transition-all duration-300 ease-out"
                style={{ 
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`
                }}
              />
            </div>
            <p className="text-center mt-2 text-sm text-white/70">
              {Math.round(progress)}%
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderModern = () => (
    <div 
      className="fixed inset-0 flex flex-col items-center justify-center z-[100]"
      style={{ 
        background: `linear-gradient(135deg, ${backgroundColor} 0%, ${primaryColor}22 100%)`
      }}
    >
      {showLogo && logoUrl && (
        <div className="mb-6">
          <img src={logoUrl} alt={appName} className="w-20 h-20 object-contain animate-pulse" />
        </div>
      )}
      
      <h1 
        className="text-3xl font-bold mb-4"
        style={{ color: primaryColor }}
      >
        {appName}
      </h1>

      <div className="relative w-16 h-16 mb-4">
        <div 
          className="absolute inset-0 rounded-full border-4"
          style={{ 
            borderColor: `${primaryColor}40`,
            borderTopColor: primaryColor,
            animation: `spin ${animSpeed} linear infinite`
          }}
        />
      </div>

      {customText && (
        <p className="text-gray-400 mb-4">{customText}</p>
      )}

      {showProgress && (
        <div className="w-48">
          <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full transition-all duration-300"
              style={{ 
                width: `${progress}%`,
                backgroundColor: primaryColor
              }}
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderMinimal = () => (
    <div 
      className="fixed inset-0 flex flex-col items-center justify-center z-[100]"
      style={{ backgroundColor }}
    >
      <div className="text-center">
        {showLogo && logoUrl && (
          <img src={logoUrl} alt={appName} className="w-16 h-16 mx-auto mb-4 opacity-80" />
        )}
        
        <h2 
          className="text-2xl font-semibold mb-6"
          style={{ color: primaryColor }}
        >
          {appName}
        </h2>

        <div className="flex gap-2 justify-center mb-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full"
              style={{ 
                backgroundColor: primaryColor,
                animation: `pulse-dot 1.4s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`
              }}
            />
          ))}
        </div>

        {customText && (
          <p className="text-sm text-gray-400">{customText}</p>
        )}
      </div>
    </div>
  );

  const renderElegant = () => (
    <div 
      className="fixed inset-0 flex flex-col items-center justify-center z-[100]"
      style={{ backgroundColor }}
    >
      <div className="text-center max-w-md">
        {showLogo && (
          <div className="mb-8">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={appName}
                className="w-24 h-24 mx-auto"
                style={{ animation: `gentle-float ${animSpeed} ease-in-out infinite` }}
              />
            ) : (
              <div 
                className="w-24 h-24 mx-auto rounded-2xl flex items-center justify-center"
                style={{ 
                  background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                  boxShadow: `0 8px 32px ${primaryColor}40`
                }}
              >
                {/* No letter - clean icon */}
              </div>
            )}
          </div>
        )}

        <h1 
          className="text-3xl font-serif font-bold mb-4"
          style={{ color: primaryColor }}
        >
          {appName}
        </h1>

        {customText && (
          <p 
            className="text-base mb-8 opacity-80"
            style={{ color: secondaryColor }}
          >
            {customText}
          </p>
        )}

        <div className="relative w-20 h-20 mx-auto mb-6">
          <svg className="w-full h-full" viewBox="0 0 50 50">
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              strokeWidth="3"
              className="opacity-20"
              style={{ stroke: primaryColor }}
            />
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              style={{ 
                stroke: primaryColor,
                strokeDasharray: '125',
                animation: `preloader-draw 1.5s ease-in-out infinite`,
                transformOrigin: 'center'
              }}
            />
          </svg>
        </div>

        {showProgress && (
          <div className="w-full max-w-xs mx-auto">
            <div 
              className="h-0.5 rounded-full overflow-hidden"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <div 
                className="h-full transition-all duration-500 ease-out"
                style={{ 
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return renderPreloader();
};

export default GlassmorphismPreloader;


