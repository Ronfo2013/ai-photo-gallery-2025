import React, { useState, useEffect } from 'react';

const COOKIE_CONSENT_KEY = 'cookie_consent_status';

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consentStatus = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consentStatus) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'granted');
    setIsVisible(false);
    // Reload to allow GtmScript to run
    window.location.reload(); 
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'denied');
    setIsVisible(false);
  };
  
  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-md border-t border-gray-700/50 p-4 z-[100] animate-slide-in-up" style={{ animationDelay: '500ms', opacity: 0 }}>
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-300 text-center md:text-left">
          We use cookies for analytics and marketing purposes, powered by Google Tag Manager, to enhance your experience. Your privacy is important to us.
        </p>
        <div className="flex-shrink-0 flex gap-3">
          <button onClick={handleDecline} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Decline
          </button>
          <button onClick={handleAccept} className="px-4 py-2 text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors">
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
