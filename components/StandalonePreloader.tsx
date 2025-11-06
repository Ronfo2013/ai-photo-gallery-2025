/**
 * Standalone Preloader Component
 * 
 * Componente completamente autonomo e riutilizzabile per qualsiasi sistema.
 * Non ha dipendenze esterne e include tutti gli stili CSS necessari.
 * 
 * @author AI Photo Gallery 2025
 * @version 1.0.0
 * @license MIT
 */

import React from 'react';

// Tipi standalone (non dipendono da altri file)
export type PreloaderStyle = 'glassmorphism' | 'modern' | 'minimal' | 'elegant';
export type AnimationSpeed = 'slow' | 'normal' | 'fast';

export interface StandalonePreloaderProps {
  /** Nome dell'applicazione da mostrare */
  appName: string;
  /** URL del logo (opzionale) */
  logoUrl?: string | null;
  /** Progresso da 0 a 100 (opzionale) */
  progress?: number;
  /** Stile del preloader */
  style?: PreloaderStyle;
  /** Colore di sfondo */
  backgroundColor?: string;
  /** Colore primario */
  primaryColor?: string;
  /** Colore secondario */
  secondaryColor?: string;
  /** Mostra il logo */
  showLogo?: boolean;
  /** Mostra la barra di progresso */
  showProgress?: boolean;
  /** Testo personalizzato */
  customText?: string;
  /** Velocità animazione */
  animationSpeed?: AnimationSpeed;
  /** Callback quando il preloader è pronto */
  onReady?: () => void;
  /** Z-index personalizzato */
  zIndex?: number;
}

const StandalonePreloader: React.FC<StandalonePreloaderProps> = ({
  appName,
  logoUrl = null,
  progress = 0,
  style = 'glassmorphism',
  backgroundColor = '#0f172a',
  primaryColor = '#14b8a6',
  secondaryColor = '#8b5cf6',
  showLogo = true,
  showProgress = true,
  customText = '',
  animationSpeed = 'normal',
  onReady,
  zIndex = 100
}) => {
  // Animation speed mapping
  const speedMap = {
    slow: '3s',
    normal: '2s',
    fast: '1s'
  };
  const animSpeed = speedMap[animationSpeed];

  // CSS Styles embedded (no external dependencies)
  const styles = `
    @keyframes float-glass {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      33% { transform: translate(30px, -30px) rotate(120deg); }
      66% { transform: translate(-20px, 20px) rotate(240deg); }
    }
    
    @keyframes gentle-float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    
    @keyframes pulse-glow {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.8; transform: scale(1.05); }
    }
    
    @keyframes text-shimmer {
      0% { background-position: 200% center; }
      100% { background-position: -200% center; }
    }
    
    @keyframes spin-glass {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    @keyframes pulse-dot {
      0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
      40% { transform: scale(1.2); opacity: 1; }
    }
    
    @keyframes preloader-draw {
      0% { stroke-dashoffset: 125; }
      50% { stroke-dashoffset: 0; }
      100% { stroke-dashoffset: -125; }
    }

    .standalone-preloader {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .glass-card {
      position: relative;
      backdrop-filter: blur(32px);
      background: rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 48px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .logo-container {
      width: 96px;
      height: 96px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 32px;
    }

    .logo-fallback {
      width: 96px;
      height: 96px;
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }

    .app-title {
      font-size: 2.25rem;
      font-weight: bold;
      text-align: center;
      margin-bottom: 24px;
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
      background-size: 200% 200%;
    }

    .custom-text {
      text-align: center;
      font-size: 1.125rem;
      margin-bottom: 32px;
    }

    .spinner {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      border: 4px solid;
      margin: 0 auto 24px;
    }

    .progress-container {
      width: 256px;
      margin: 0 auto;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 9999px;
      overflow: hidden;
      backdrop-filter: blur(4px);
    }

    .progress-fill {
      height: 100%;
      border-radius: 9999px;
      transition: width 0.3s ease-out;
    }

    .progress-text {
      text-align: center;
      margin-top: 8px;
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.7);
    }

    .dots-container {
      display: flex;
      gap: 8px;
      justify-content: center;
      margin-bottom: 16px;
    }

    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }

    .elegant-spinner {
      width: 80px;
      height: 80px;
      margin: 0 auto 24px;
    }
  `;

  React.useEffect(() => {
    onReady?.();
  }, [onReady]);

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
      className="standalone-preloader"
      style={{ backgroundColor, zIndex }}
    >
      <style>{styles}</style>
      
      {/* Floating glass orbs in background */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <div 
          style={{ 
            position: 'absolute',
            top: '25%',
            left: '25%',
            width: '288px',
            height: '288px',
            borderRadius: '50%',
            opacity: 0.2,
            filter: 'blur(48px)',
            background: `radial-gradient(circle, ${primaryColor}, transparent)`,
            animation: `float-glass ${animSpeed} ease-in-out infinite`
          }}
        />
        <div 
          style={{ 
            position: 'absolute',
            bottom: '33%',
            right: '25%',
            width: '384px',
            height: '384px',
            borderRadius: '50%',
            opacity: 0.2,
            filter: 'blur(48px)',
            background: `radial-gradient(circle, ${secondaryColor}, transparent)`,
            animation: `float-glass ${animSpeed} ease-in-out infinite reverse`
          }}
        />
      </div>

      {/* Glass card container */}
      <div 
        className="glass-card"
        style={{ animation: `gentle-float ${animSpeed} ease-in-out infinite` }}
      >
        {/* Logo */}
        {showLogo && (
          <div className="logo-container">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={appName}
                style={{ 
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  animation: `pulse-glow ${animSpeed} ease-in-out infinite`
                }}
              />
            ) : (
              <div 
                className="logo-fallback"
                style={{ 
                  background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                  animation: `pulse-glow ${animSpeed} ease-in-out infinite`
                }}
              />
            )}
          </div>
        )}

        {/* App name with gradient */}
        <h1 
          className="app-title"
          style={{ 
            backgroundImage: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
            animation: `text-shimmer ${animSpeed} linear infinite`
          }}
        >
          {appName}
        </h1>

        {/* Custom text */}
        {customText && (
          <p 
            className="custom-text"
            style={{ color: primaryColor }}
          >
            {customText}
          </p>
        )}

        {/* Spinner */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div 
            className="spinner"
            style={{ 
              borderColor: `${primaryColor} transparent transparent transparent`,
              animation: `spin-glass ${animSpeed} linear infinite`
            }}
          />
        </div>

        {/* Progress bar */}
        {showProgress && (
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`
                }}
              />
            </div>
            <p className="progress-text">
              {Math.round(progress)}%
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderModern = () => (
    <div 
      className="standalone-preloader"
      style={{ 
        background: `linear-gradient(135deg, ${backgroundColor} 0%, ${primaryColor}22 100%)`,
        zIndex
      }}
    >
      <style>{styles}</style>
      
      {showLogo && logoUrl && (
        <div style={{ marginBottom: '24px' }}>
          <img 
            src={logoUrl} 
            alt={appName} 
            style={{ 
              width: '80px', 
              height: '80px', 
              objectFit: 'contain',
              animation: `pulse-glow ${animSpeed} ease-in-out infinite`
            }} 
          />
        </div>
      )}
      
      <h1 
        style={{ 
          fontSize: '1.875rem',
          fontWeight: 'bold',
          marginBottom: '16px',
          color: primaryColor
        }}
      >
        {appName}
      </h1>

      <div style={{ position: 'relative', width: '64px', height: '64px', marginBottom: '16px' }}>
        <div 
          style={{ 
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '4px solid',
            borderColor: `${primaryColor}40`,
            borderTopColor: primaryColor,
            animation: `spin ${animSpeed} linear infinite`
          }}
        />
      </div>

      {customText && (
        <p style={{ color: '#9ca3af', marginBottom: '16px' }}>{customText}</p>
      )}

      {showProgress && (
        <div style={{ width: '192px' }}>
          <div style={{ 
            width: '100%', 
            height: '4px', 
            backgroundColor: '#374151', 
            borderRadius: '9999px', 
            overflow: 'hidden' 
          }}>
            <div 
              style={{ 
                height: '100%',
                width: `${progress}%`,
                backgroundColor: primaryColor,
                transition: 'width 0.3s ease-out'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderMinimal = () => (
    <div 
      className="standalone-preloader"
      style={{ backgroundColor, zIndex }}
    >
      <style>{styles}</style>
      
      <div style={{ textAlign: 'center' }}>
        {showLogo && logoUrl && (
          <img 
            src={logoUrl} 
            alt={appName} 
            style={{ 
              width: '64px', 
              height: '64px', 
              margin: '0 auto 16px',
              opacity: 0.8
            }} 
          />
        )}
        
        <h2 
          style={{ 
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '24px',
            color: primaryColor
          }}
        >
          {appName}
        </h2>

        <div className="dots-container">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="dot"
              style={{ 
                backgroundColor: primaryColor,
                animation: `pulse-dot 1.4s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`
              }}
            />
          ))}
        </div>

        {customText && (
          <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>{customText}</p>
        )}
      </div>
    </div>
  );

  const renderElegant = () => (
    <div 
      className="standalone-preloader"
      style={{ backgroundColor, zIndex }}
    >
      <style>{styles}</style>
      
      <div style={{ textAlign: 'center', maxWidth: '384px' }}>
        {showLogo && (
          <div style={{ marginBottom: '32px' }}>
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={appName}
                style={{ 
                  width: '96px',
                  height: '96px',
                  margin: '0 auto',
                  animation: `gentle-float ${animSpeed} ease-in-out infinite`
                }}
              />
            ) : (
              <div 
                style={{ 
                  width: '96px',
                  height: '96px',
                  margin: '0 auto',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                  boxShadow: `0 8px 32px ${primaryColor}40`
                }}
              />
            )}
          </div>
        )}

        <h1 
          style={{ 
            fontSize: '1.875rem',
            fontFamily: 'serif',
            fontWeight: 'bold',
            marginBottom: '16px',
            color: primaryColor
          }}
        >
          {appName}
        </h1>

        {customText && (
          <p 
            style={{ 
              fontSize: '1rem',
              marginBottom: '32px',
              opacity: 0.8,
              color: secondaryColor
            }}
          >
            {customText}
          </p>
        )}

        <div className="elegant-spinner">
          <svg width="100%" height="100%" viewBox="0 0 50 50">
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              strokeWidth="3"
              style={{ stroke: primaryColor, opacity: 0.2 }}
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
          <div style={{ width: '100%', maxWidth: '288px', margin: '0 auto' }}>
            <div 
              style={{ 
                height: '2px',
                borderRadius: '9999px',
                overflow: 'hidden',
                backgroundColor: `${primaryColor}20`
              }}
            >
              <div 
                style={{ 
                  height: '100%',
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`,
                  transition: 'width 0.5s ease-out'
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

export default StandalonePreloader;
