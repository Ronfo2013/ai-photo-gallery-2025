import React, { useEffect } from 'react';
import { Album, SiteSettings } from '../types';
import { getShareUrl } from '../utils/urlUtils';

interface AlbumMetaTagsProps {
  album: Album;
  siteSettings: SiteSettings;
}

const AlbumMetaTags: React.FC<AlbumMetaTagsProps> = ({ album, siteSettings }) => {
  useEffect(() => {
    // Aggiorna title
    document.title = `${album.title} - ${siteSettings.appName}`;

    // Aggiorna o crea meta tags
    const updateMetaTag = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    const updateMetaName = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Open Graph tags per preview social
    updateMetaTag('og:title', album.title);
    updateMetaTag('og:description', `Guarda ${album.photos.length} foto in questo album di ${siteSettings.appName}`);
    updateMetaTag('og:image', album.coverPhotoUrl);
    updateMetaTag('og:url', getShareUrl(album.id));
    updateMetaTag('og:type', 'website');
    updateMetaTag('og:site_name', siteSettings.appName);

    // Twitter Card tags
    updateMetaName('twitter:card', 'summary_large_image');
    updateMetaName('twitter:title', album.title);
    updateMetaName('twitter:description', `Guarda ${album.photos.length} foto in questo album`);
    updateMetaName('twitter:image', album.coverPhotoUrl);

    // Meta description standard
    updateMetaName('description', `${album.title} - Album con ${album.photos.length} foto su ${siteSettings.appName}`);

    return () => {
      // Cleanup quando il componente si smonta
      document.title = siteSettings.appName;
      
      // Rimuovi meta tags specifici dell'album
      const metasToRemove = [
        'meta[property="og:title"]',
        'meta[property="og:description"]', 
        'meta[property="og:image"]',
        'meta[property="og:url"]',
        'meta[name="twitter:title"]',
        'meta[name="twitter:description"]',
        'meta[name="twitter:image"]'
      ];
      
      metasToRemove.forEach(selector => {
        const meta = document.querySelector(selector);
        if (meta) {
          meta.remove();
        }
      });
    };
  }, [album, siteSettings]);

  return null;
};

export default AlbumMetaTags;
