import React, { useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';

// Declare global dataLayer for TypeScript
declare global {
  interface Window {
    dataLayer: any[];
  }
}

const GtmScript: React.FC = () => {
  const { siteSettings } = useAppContext();
  const { gtmId } = siteSettings;
  const currentGtmId = useRef<string>('');

  useEffect(() => {
    const consentStatus = localStorage.getItem('cookie_consent_status');

    // Clean up previous GTM installation if GTM ID changed or was removed
    if (currentGtmId.current && currentGtmId.current !== gtmId) {
      console.log(`GTM: Cleaning up previous installation (${currentGtmId.current})`);
      
      // Remove existing script
      const existingScript = document.getElementById('gtm-script');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
      
      // Remove existing noscript iframe
      const existingNoscript = document.querySelector('noscript iframe[src*="googletagmanager.com"]');
      if (existingNoscript?.parentElement) {
        document.body.removeChild(existingNoscript.parentElement);
      }
      
      // Clear dataLayer if it exists (optional, depends on requirements)
      if (window.dataLayer) {
        console.log('GTM: Clearing dataLayer for new container');
        window.dataLayer.length = 0;
      }
    }

    // Install new GTM if ID is provided and consent is granted
    if (gtmId && consentStatus === 'granted') {
      console.log(`GTM: Installing container ${gtmId}`);
      
      const script = document.createElement('script');
      script.id = 'gtm-script';
      script.async = true;
      script.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${gtmId}');
      `;
      document.head.appendChild(script);

      const noscript = document.createElement('noscript');
      noscript.id = 'gtm-noscript';
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.googletagmanager.com/ns.html?id=${gtmId}`;
      iframe.height = '0';
      iframe.width = '0';
      iframe.style.display = 'none';
      iframe.style.visibility = 'hidden';
      noscript.appendChild(iframe);
      document.body.prepend(noscript);

      currentGtmId.current = gtmId;
    } else if (!gtmId && currentGtmId.current) {
      // GTM ID was removed, clean up
      console.log('GTM: Removing container (ID cleared)');
      currentGtmId.current = '';
    }

    // Cleanup function for component unmount
    return () => {
      // Only clean up on unmount if needed for SPA navigation
      // Usually GTM persists across page changes
    };
  }, [gtmId]);

  return null; // This component does not render anything
};

export default GtmScript;
