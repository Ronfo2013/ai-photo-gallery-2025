import React, { useState } from 'react';
import { SeoSettings } from '../types';
import { useAppContext } from '../context/AppContext';
import Spinner from './Spinner';

interface SeoManagerProps {
  settings: SeoSettings;
  onSettingsChange: (newSettings: SeoSettings) => void;
}

const SeoManager: React.FC<SeoManagerProps> = ({ settings, onSettingsChange }) => {
  const { getSeoSuggestions } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onSettingsChange({ ...settings, [name]: value });
  };

  const handleGenerateSuggestions = async () => {
    setIsLoading(true);
    const result = await getSeoSuggestions();
    // Directly apply the suggestions to the form fields
    if(result) {
        onSettingsChange(result);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={handleGenerateSuggestions}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-md text-white font-semibold transition-colors disabled:bg-gray-600"
        >
          {isLoading ? <Spinner size="h-5 w-5" /> : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2V4z" />
              <path d="M5 12a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2v-2z" />
            </svg>
          )}
          Generate AI Suggestions
        </button>
      </div>

      <div>
        <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-300 mb-1">Meta Title</label>
        <input
          id="metaTitle"
          name="metaTitle"
          type="text"
          value={settings.metaTitle}
          onChange={handleInputChange}
          className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        />
      </div>

      <div>
        <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-300 mb-1">Meta Description</label>
        <textarea
          id="metaDescription"
          name="metaDescription"
          rows={3}
          value={settings.metaDescription}
          onChange={handleInputChange}
          className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        />
      </div>

      <div>
        <label htmlFor="metaKeywords" className="block text-sm font-medium text-gray-300 mb-1">Meta Keywords (comma-separated)</label>
        <input
          id="metaKeywords"
          name="metaKeywords"
          type="text"
          value={settings.metaKeywords}
          onChange={handleInputChange}
          className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        />
      </div>
      
       <div>
        <label htmlFor="structuredData" className="block text-sm font-medium text-gray-300 mb-1">Structured Data (JSON-LD)</label>
        <textarea
          id="structuredData"
          name="structuredData"
          rows={5}
          value={settings.structuredData}
          onChange={handleInputChange}
          className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          placeholder='{ "@context": "https://schema.org", ... }'
        />
      </div>
    </div>
  );
};

export default SeoManager;