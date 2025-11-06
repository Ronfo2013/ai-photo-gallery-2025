import React from 'react';
import { useAppContext } from '../context/AppContext';

const Footer: React.FC = () => {
  const { siteSettings } = useAppContext();

  return (
    <footer className="bg-gray-900/80 mt-8 py-4 border-t border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400 text-sm">
        <p>{siteSettings.footerText}</p>
      </div>
    </footer>
  );
};

export default Footer;
