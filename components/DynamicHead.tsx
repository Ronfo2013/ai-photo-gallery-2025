import React, { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

const DynamicHead: React.FC = () => {
  const { siteSettings } = useAppContext();

  useEffect(() => {
    // Aggiorna il titolo della pagina solo se MetaInjector non ha già impostato un titolo SEO
    const seoTitle = siteSettings.seo?.metaTitle;
    if (!seoTitle || seoTitle.trim() === '') {
      document.title = siteSettings.appName || 'AI Photo Gallery';
    }
  }, [siteSettings.appName, siteSettings.seo?.metaTitle]);

  useEffect(() => {
    // Aggiorna la favicon se c'è un logo personalizzato
    const updateFavicon = (href: string, type: string = 'image/x-icon') => {
      // Trova favicon esistente o creane una nuova
      let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }
      
      // Aggiorna solo se diverso per evitare flickering
      if (favicon.href !== href) {
        favicon.type = type;
        favicon.href = href;
        
        // Gestione errore caricamento favicon
        favicon.onerror = () => {
          console.warn('Failed to load favicon:', href);
          // Fallback to default favicon
          if (href !== '/favicon.svg') {
            updateFavicon('/favicon.svg', 'image/svg+xml');
          }
        };
      }
    };

    if (siteSettings.logoUrl) {
      updateFavicon(siteSettings.logoUrl, 'image/x-icon');
    } else {
      updateFavicon('/favicon.svg', 'image/svg+xml');
    }
  }, [siteSettings.logoUrl]);

  // Questo componente non renderizza nulla visivamente
  return null;
};

export default DynamicHead;
