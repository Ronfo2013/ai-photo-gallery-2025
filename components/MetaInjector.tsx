import React, { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

const MetaInjector: React.FC = () => {
  const { siteSettings } = useAppContext();
  const { appName, seo } = siteSettings;
  const { metaTitle, metaDescription, structuredData } = seo;

  useEffect(() => {
    // Set document title solo se c'è un metaTitle SEO specifico
    if (metaTitle && metaTitle.trim() !== '') {
      document.title = metaTitle;
    }
    // Se non c'è metaTitle, lascia che DynamicHead gestisca il titolo con appName

    // Set meta description
    let descriptionTag = document.querySelector('meta[name="description"]');
    if (!descriptionTag) {
      descriptionTag = document.createElement('meta');
      descriptionTag.setAttribute('name', 'description');
      document.head.appendChild(descriptionTag);
    }
    descriptionTag.setAttribute('content', metaDescription || '');

    // Set structured data
    const structuredDataScript = document.getElementById('structured-data-script');
    if (structuredDataScript) {
      // First, check if there is any actual content to parse.
      if (structuredData && structuredData.trim() !== '') {
        try {
          // Ensure it's valid JSON before setting
          JSON.parse(structuredData);
          structuredDataScript.textContent = structuredData;
        } catch (e) {
          console.warn("The structured data from settings is invalid JSON. It will not be injected.", e);
          structuredDataScript.textContent = ''; // Clear if invalid
        }
      } else {
        // If the data is empty or whitespace, ensure the script tag is empty.
        structuredDataScript.textContent = '';
      }
    }
    
  }, [appName, metaTitle, metaDescription, structuredData]);

  return null; // This component does not render anything
};

export default MetaInjector;