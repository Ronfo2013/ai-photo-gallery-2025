import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import Header from './components/Header';
import Footer from './components/Footer';
import AlbumList from './pages/AlbumList';
import AlbumView from './pages/AlbumView';
import AdminPanel from './pages/AdminPanel';
import Preloader from './components/Preloader';
import GlassmorphismPreloader from './components/GlassmorphismPreloader';
import MetaInjector from './components/MetaInjector';
import DynamicHead from './components/DynamicHead';
import CookieConsent from './components/CookieConsent';
import GtmScript from './components/GtmScript';

const MainApp: React.FC = () => {
  return (
    <HashRouter>
      <MetaInjector />
      <DynamicHead />
      <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col animate-fade-in">
        <Header />
        <main className="container mx-auto p-4 md:p-6 flex-grow">
          <Routes>
            <Route path="/" element={<AlbumList />} />
            <Route path="/album/:albumId" element={<AlbumView />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </main>
        <Footer />
        <CookieConsent />
        <GtmScript />
      </div>
    </HashRouter>
  );
};

const AppWithPreloader: React.FC = () => {
  const { loading, siteSettings } = useAppContext();
  const [showPreloader, setShowPreloader] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simula progresso di caricamento
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    const minPreloadTime = 2000;
    const startTime = Date.now();
    
    const checkCanHidePreloader = () => {
      const elapsedTime = Date.now() - startTime;
      const hasMinTimePassed = elapsedTime >= minPreloadTime;
      const isDataLoaded = !loading && progress >= 100;
      
      if (hasMinTimePassed && isDataLoaded) {
        setShowPreloader(false);
      } else {
        setTimeout(checkCanHidePreloader, 100);
      }
    };
    
    checkCanHidePreloader();

    return () => clearInterval(progressInterval);
  }, [loading, progress]);

  if (showPreloader && siteSettings.preloader?.enabled && siteSettings.preloader) {
    return (
      <GlassmorphismPreloader 
        appName={siteSettings.appName} 
        logoUrl={siteSettings.logoUrl}
        progress={progress}
        settings={siteSettings.preloader}
      />
    );
  }

  // Fallback to simple preloader if disabled
  if (showPreloader) {
    return (
      <Preloader 
        appName={siteSettings.appName} 
        logoUrl={siteSettings.logoUrl} 
      />
    );
  }

  return <MainApp />;
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppWithPreloader />
    </AppProvider>
  );
};

export default App;