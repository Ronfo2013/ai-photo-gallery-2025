/**
 * Utilità per gestire URL e domini personalizzati
 */

import { SiteSettings } from '../types';

/**
 * Ottiene l'URL base dell'applicazione
 * Usa prioritariamente il siteUrl configurato dall'admin
 */
export const getBaseUrl = (siteSettings?: SiteSettings): string => {
  // PRIORITÀ 1: URL configurato dall'admin in SiteSettings
  if (siteSettings?.siteUrl && siteSettings.siteUrl.trim() !== '') {
    return siteSettings.siteUrl.replace(/\/$/, ''); // Rimuovi trailing slash
  }
  
  // PRIORITÀ 2: Variabile d'ambiente VITE_APP_URL
  if (import.meta.env.VITE_APP_URL) {
    return import.meta.env.VITE_APP_URL;
  }
  
  // PRIORITÀ 3: In produzione, usa URL di Cloud Run
  if (import.meta.env.PROD) {
    return 'https://ai-photo-gallery-595991638389.us-west1.run.app';
  }
  
  // PRIORITÀ 4: Fallback finale - usa window.location.origin
  return window.location.origin;
};

/**
 * Genera l'URL di condivisione per un album
 * Usa il dominio configurato dall'admin se disponibile
 */
export const getShareUrl = (albumId: string, siteSettings?: SiteSettings): string => {
  return `${getBaseUrl(siteSettings)}/#/album/${albumId}`;
};

/**
 * Genera l'URL completo per una risorsa specifica
 */
export const getFullUrl = (path: string, siteSettings?: SiteSettings): string => {
  const baseUrl = getBaseUrl(siteSettings);
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};
