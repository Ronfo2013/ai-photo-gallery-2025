/**
 * Esempi di utilizzo del StandalonePreloader
 * 
 * Questo file mostra come utilizzare il componente StandalonePreloader
 * in diversi scenari e configurazioni.
 */

import React, { useState, useEffect } from 'react';
import StandalonePreloader from './StandalonePreloader';

// Esempio 1: Preloader base con progress simulato
export const BasicPreloaderExample: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setIsLoading(false);
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  if (!isLoading) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">App Caricata!</h2>
        <p>Il preloader è terminato.</p>
      </div>
    );
  }

  return (
    <StandalonePreloader
      appName="La Mia App"
      progress={progress}
      customText="Caricamento in corso..."
      style="glassmorphism"
      primaryColor="#14b8a6"
      secondaryColor="#8b5cf6"
    />
  );
};

// Esempio 2: Preloader moderno senza progress
export const ModernPreloaderExample: React.FC = () => {
  return (
    <StandalonePreloader
      appName="Modern App"
      logoUrl="https://via.placeholder.com/100x100/14b8a6/ffffff?text=M"
      style="modern"
      backgroundColor="#1f2937"
      primaryColor="#3b82f6"
      secondaryColor="#06b6d4"
      showProgress={false}
      customText="Inizializzazione..."
      animationSpeed="fast"
    />
  );
};

// Esempio 3: Preloader minimale
export const MinimalPreloaderExample: React.FC = () => {
  return (
    <StandalonePreloader
      appName="Minimal"
      style="minimal"
      backgroundColor="#000000"
      primaryColor="#ffffff"
      showLogo={false}
      showProgress={false}
      customText="Loading..."
      animationSpeed="slow"
    />
  );
};

// Esempio 4: Preloader elegante con logo personalizzato
export const ElegantPreloaderExample: React.FC = () => {
  return (
    <StandalonePreloader
      appName="Elegant Gallery"
      logoUrl="https://via.placeholder.com/100x100/8b5cf6/ffffff?text=EG"
      style="elegant"
      backgroundColor="#0f172a"
      primaryColor="#f59e0b"
      secondaryColor="#ef4444"
      progress={75}
      customText="Preparazione dell'esperienza..."
      animationSpeed="normal"
    />
  );
};

// Esempio 5: Demo interattiva con controlli
export const InteractivePreloaderDemo: React.FC = () => {
  const [config, setConfig] = useState({
    appName: 'Demo App',
    style: 'glassmorphism' as const,
    backgroundColor: '#0f172a',
    primaryColor: '#14b8a6',
    secondaryColor: '#8b5cf6',
    progress: 50,
    showLogo: true,
    showProgress: true,
    customText: 'Caricamento demo...',
    animationSpeed: 'normal' as const
  });

  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      {/* Preloader */}
      <StandalonePreloader {...config} />
      
      {/* Pannello di controllo */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '20px',
        borderRadius: '8px',
        zIndex: 200,
        maxWidth: '300px'
      }}>
        <h3 style={{ marginBottom: '16px' }}>Controlli Demo</h3>
        
        <div style={{ marginBottom: '12px' }}>
          <label>Nome App:</label>
          <input
            type="text"
            value={config.appName}
            onChange={(e) => setConfig(prev => ({ ...prev, appName: e.target.value }))}
            style={{ width: '100%', padding: '4px', marginTop: '4px', color: 'black' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>Stile:</label>
          <select
            value={config.style}
            onChange={(e) => setConfig(prev => ({ ...prev, style: e.target.value as any }))}
            style={{ width: '100%', padding: '4px', marginTop: '4px', color: 'black' }}
          >
            <option value="glassmorphism">Glassmorphism</option>
            <option value="modern">Modern</option>
            <option value="minimal">Minimal</option>
            <option value="elegant">Elegant</option>
          </select>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>Progress: {config.progress}%</label>
          <input
            type="range"
            min="0"
            max="100"
            value={config.progress}
            onChange={(e) => setConfig(prev => ({ ...prev, progress: parseInt(e.target.value) }))}
            style={{ width: '100%', marginTop: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>Colore Primario:</label>
          <input
            type="color"
            value={config.primaryColor}
            onChange={(e) => setConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
            style={{ width: '100%', marginTop: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>Velocità:</label>
          <select
            value={config.animationSpeed}
            onChange={(e) => setConfig(prev => ({ ...prev, animationSpeed: e.target.value as any }))}
            style={{ width: '100%', padding: '4px', marginTop: '4px', color: 'black' }}
          >
            <option value="slow">Lenta</option>
            <option value="normal">Normale</option>
            <option value="fast">Veloce</option>
          </select>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>
            <input
              type="checkbox"
              checked={config.showProgress}
              onChange={(e) => setConfig(prev => ({ ...prev, showProgress: e.target.checked }))}
              style={{ marginRight: '8px' }}
            />
            Mostra Progress
          </label>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>
            <input
              type="checkbox"
              checked={config.showLogo}
              onChange={(e) => setConfig(prev => ({ ...prev, showLogo: e.target.checked }))}
              style={{ marginRight: '8px' }}
            />
            Mostra Logo
          </label>
        </div>
      </div>
    </div>
  );
};

export default {
  BasicPreloaderExample,
  ModernPreloaderExample,
  MinimalPreloaderExample,
  ElegantPreloaderExample,
  InteractivePreloaderDemo
};
