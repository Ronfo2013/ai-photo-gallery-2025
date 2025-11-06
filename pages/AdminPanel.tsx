import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { SiteSettings } from '../types';
import Spinner from '../components/Spinner';
import AlbumPhotoManager from '../components/AlbumPhotoManager';
import SeoManager from '../components/SeoManager';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import AdminLogin from '../components/AdminLogin';
import BackupManager from '../components/BackupManager';

const AdminPanel: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading, login, logout } = useFirebaseAuth();
  const { 
    siteSettings, 
    updateSiteSettings, 
    albums, 
    addAlbum, 
    deleteAlbum,
    recoverFromStorage,
    resetToDefaults
  } = useAppContext();
  
  // State for forms and UI
  const [localSettings, setLocalSettings] = useState<SiteSettings>(siteSettings);
  const [isSaving, setIsSaving] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);

  const [expandedAlbumId, setExpandedAlbumId] = useState<string | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);

  useEffect(() => {
    // Sync local state when context updates
    setLocalSettings(siteSettings);
  }, [siteSettings]);

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('seo.')) {
        const seoField = name.split('.')[1];
        setLocalSettings(prev => ({
            ...prev,
            seo: {
                ...prev.seo,
                [seoField]: value,
            }
        }));
    } else {
        setLocalSettings(prev => ({...prev, [name]: value }));
    }
  };
  
  const handleNavLinkChange = (index: number, field: 'text' | 'to', value: string) => {
    const updatedLinks = [...localSettings.navLinks];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    setLocalSettings(prev => ({ ...prev, navLinks: updatedLinks }));
  };

  const handleAddNavLink = () => {
    const newLink = { id: `nav-${new Date().getTime()}`, text: 'New Link', to: '#' };
    setLocalSettings(prev => ({ ...prev, navLinks: [...prev.navLinks, newLink] }));
  };

  const handleDeleteNavLink = (id: string) => {
    setLocalSettings(prev => ({
      ...prev,
      navLinks: prev.navLinks.filter(link => link.id !== id),
    }));
  };

  const handleMainSettingsSave = async () => {
    setIsSaving(true);
    const newLogoFile = logoInputRef.current?.files?.[0];
    const { appName, footerText, navLinks, logoUrl, logoPath, siteUrl } = localSettings;
    
    // Create a settings object with only the relevant fields
    const settingsToUpdate: Partial<SiteSettings> = { appName, footerText, navLinks, logoUrl, logoPath, siteUrl };

    await updateSiteSettings(settingsToUpdate, newLogoFile);
    if(logoInputRef.current) logoInputRef.current.value = ""; // Clear file input
    setIsSaving(false);
  };

  const handlePreloaderSettingsSave = async () => {
    setIsSaving(true);
    const { preloader } = localSettings;
    await updateSiteSettings({ preloader });
    setIsSaving(false);
  };

  const handleSeoAndTrackingSave = async () => {
    setIsSaving(true);
    const { gtmId, seo, aiEnabled, geminiApiKey } = localSettings;
    await updateSiteSettings({ gtmId, seo, aiEnabled, geminiApiKey });
    setIsSaving(false);
  }

  const handleRemoveLogo = async () => {
    if (window.confirm('Are you sure you want to remove the logo?')) {
        setIsSaving(true);
        await updateSiteSettings({ logoUrl: null });
        setIsSaving(false);
    }
  };

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumTitle.trim()) return;
    setIsCreatingAlbum(true);
    await addAlbum(newAlbumTitle);
    setNewAlbumTitle('');
    setIsCreatingAlbum(false);
  };
  
  const handleDeleteAlbum = async (albumId: string) => {
    if (window.confirm('Are you sure you want to delete this album and all its photos? This action cannot be undone.')) {
        await deleteAlbum(albumId);
    }
  }

  const toggleAlbumExpansion = (albumId: string) => {
    setExpandedAlbumId(prevId => prevId === albumId ? null : albumId);
  }

  const handleRecoverFromStorage = async () => {
    if (!confirm('🔄 Vuoi recuperare tutte le foto da Firebase Storage?\n\nQuesta operazione creerà un nuovo album con tutte le foto trovate.')) {
      return;
    }
    
    setIsRecovering(true);
    try {
      await recoverFromStorage();
      alert('✅ Recupero completato! Controlla il nuovo album "Recovered Photos"');
    } catch (error) {
      console.error('Recovery error:', error);
      alert('❌ Errore durante il recupero. Controlla la console per i dettagli.');
    } finally {
      setIsRecovering(false);
    }
  };

  const handleResetToDefaults = async () => {
    if (!confirm('⚠️ Questo ripristinerà tutte le configurazioni ai valori di default e nasconderà Admin dalla navbar pubblica. Continuare?')) {
      return;
    }
    
    setIsSaving(true);
    try {
      await resetToDefaults();
      // Update local settings to match the reset
      setLocalSettings(siteSettings);
      alert('✅ Reset completato! Le configurazioni sono state ripristinate ai valori di default.');
    } catch (error) {
      console.error('Reset error:', error);
      alert('❌ Errore durante il reset. Controlla la console per i dettagli.');
    } finally {
      setIsSaving(false);
    }
  };

  // Auth loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="h-12 w-12" />
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <AdminLogin onLogin={login} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header with logout */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl md:text-4xl font-bold text-teal-300">Admin Panel</h1>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white text-sm transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>

      {/* Site Settings */}
      <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700/50">
        <h2 className="text-2xl font-bold mb-4 text-white">Site Settings</h2>
        <div className="space-y-6">
          
          <div>
            <label htmlFor="appName" className="block text-sm font-medium text-gray-300 mb-1">
              Application Title
            </label>
            <input
              id="appName"
              name="appName"
              type="text"
              value={localSettings.appName}
              onChange={handleSettingsChange}
              className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label htmlFor="logo" className="block text-sm font-medium text-gray-300 mb-1">
              Site Logo
            </label>
            <div className="flex items-center gap-4">
              {localSettings.logoUrl && <img src={localSettings.logoUrl} alt="logo" className="h-10 w-auto bg-gray-700 rounded"/>}
              <input ref={logoInputRef} id="logo" type="file" accept="image/png, image/jpeg, image/svg+xml" className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-700 transition-colors"/>
              {localSettings.logoUrl && (
                <button onClick={handleRemoveLogo} className="px-3 py-2 text-sm bg-red-600 hover:bg-red-700 rounded-md text-white transition-colors">Remove</button>
              )}
            </div>
             <p className="text-xs text-gray-500 mt-1">Recommended: PNG with transparent background, max height 40px.</p>
          </div>
          
          <div>
            <label htmlFor="footerText" className="block text-sm font-medium text-gray-300 mb-1">
              Footer Text
            </label>
            <input
              id="footerText"
              name="footerText"
              type="text"
              value={localSettings.footerText}
              onChange={handleSettingsChange}
              className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label htmlFor="siteUrl" className="block text-sm font-medium text-gray-300 mb-1">
              🔗 Site URL (per condivisione album)
            </label>
            <input
              id="siteUrl"
              name="siteUrl"
              type="url"
              value={localSettings.siteUrl || ''}
              onChange={handleSettingsChange}
              placeholder="https://gallery.tuodominio.it"
              className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              URL pubblico del tuo sito. Lascia vuoto per usare l'URL di Cloud Run.
            </p>
            <p className="text-xs text-teal-400 mt-1">
              Esempio: https://gallery.tuodominio.it
            </p>
          </div>
          
          <div>
            <h3 className="text-md font-medium text-gray-300 mb-2">Navigation Links</h3>
            <div className="space-y-2">
                {localSettings.navLinks.map((link, index) => (
                    <div key={link.id} className="flex items-center gap-2 p-2 bg-gray-900/50 rounded-md">
                        <input
                            type="text"
                            placeholder="Link Text"
                            value={link.text}
                            onChange={(e) => handleNavLinkChange(index, 'text', e.target.value)}
                            className="w-1/3 bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-sm focus:ring-teal-500 focus:border-teal-500"
                        />
                        <input
                            type="text"
                            placeholder="Destination (e.g., /admin)"
                            value={link.to}
                             onChange={(e) => handleNavLinkChange(index, 'to', e.target.value)}
                            className="flex-grow bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-sm focus:ring-teal-500 focus:border-teal-500"
                        />
                        <button onClick={() => handleDeleteNavLink(link.id)} className="p-1 text-red-400 hover:text-red-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                ))}
            </div>
            <button onClick={handleAddNavLink} className="mt-2 text-sm text-teal-400 hover:text-teal-300">+ Add Link</button>
          </div>

          <div className="text-right pt-4">
            <button
              onClick={handleMainSettingsSave}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-md text-white font-semibold transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {isSaving ? <Spinner size="h-5 w-5" /> : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Album Management */}
      <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700/50">
        <h2 className="text-2xl font-bold mb-4 text-white">Album Management</h2>
        
        <div className="space-y-4 mb-6">
          <form onSubmit={handleCreateAlbum} className="flex gap-2">
            <input
              type="text"
              value={newAlbumTitle}
              onChange={(e) => setNewAlbumTitle(e.target.value)}
              placeholder="New album title..."
              className="flex-grow bg-gray-900 border border-gray-700 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
            <button
              type="submit"
              disabled={isCreatingAlbum}
              className="inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-md text-white font-semibold transition-colors disabled:bg-gray-600"
            >
              {isCreatingAlbum ? <Spinner size="h-5 w-5" /> : 'Create Album'}
            </button>
          </form>
          
          {/* Recovery Button */}
          <div className="flex items-center gap-2 p-3 bg-amber-900/20 border border-amber-600/30 rounded-md">
            <div className="text-amber-400">🔄</div>
            <div className="flex-grow">
              <div className="text-sm font-medium text-amber-200">Recupero Foto</div>
              <div className="text-xs text-amber-300/80">Recupera tutte le foto da Firebase Storage</div>
            </div>
            <button
              onClick={handleRecoverFromStorage}
              disabled={isRecovering}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md text-white transition-colors text-sm"
            >
              {isRecovering ? 'Recuperando...' : 'Recupera'}
            </button>
          </div>

          {/* Reset to Defaults Button */}
          <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-600/30 rounded-md">
            <div className="text-red-400">⚠️</div>
            <div className="flex-grow">
              <div className="text-sm font-medium text-red-200">Reset Configurazioni</div>
              <div className="text-xs text-red-300/80">Ripristina le configurazioni di default (nasconde Admin dalla navbar)</div>
            </div>
            <button
              onClick={handleResetToDefaults}
              disabled={isSaving}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md text-white transition-colors text-sm"
            >
              {isSaving ? 'Resettando...' : 'Reset'}
            </button>
          </div>

          {/* Backup Manager Section */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-white mb-4">🛡️ Sistema di Backup</h3>
            <BackupManager 
              onBackupCreated={() => console.log('✅ Backup creato con successo!')}
              onBackupRestored={() => console.log('✅ Configurazione ripristinata!')}
            />
          </div>
        </div>


        <div className="space-y-4">
          {albums.map(album => (
            <div key={album.id} className="bg-gray-900/70 p-4 rounded-md border border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{album.title} ({album.photos.length} photos)</h3>
                <div className="flex gap-2">
                   <button onClick={() => toggleAlbumExpansion(album.id)} className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 rounded-md text-white transition-colors">
                    {expandedAlbumId === album.id ? 'Collapse' : 'Manage'}
                  </button>
                  <button onClick={() => handleDeleteAlbum(album.id)} className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 rounded-md text-white transition-colors">Delete</button>
                </div>
              </div>
              {expandedAlbumId === album.id && (
                <AlbumPhotoManager key={album.id} album={album} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Preloader Settings */}
      <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700/50">
        <h2 className="text-2xl font-bold mb-4 text-white">Preloader Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.preloader?.enabled || false}
                onChange={(e) => setLocalSettings(prev => ({
                  ...prev,
                  preloader: { 
                    ...(prev.preloader || {
                      style: 'glassmorphism',
                      backgroundColor: '#0f172a',
                      primaryColor: '#14b8a6',
                      secondaryColor: '#8b5cf6',
                      showLogo: true,
                      showProgress: true,
                      customText: 'Loading your moments...',
                      animationSpeed: 'normal'
                    }), 
                    enabled: e.target.checked 
                  }
                }))}
                className="w-4 h-4 text-teal-600 bg-gray-900 border-gray-700 rounded focus:ring-teal-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-300">Enable Custom Preloader</span>
            </label>
          </div>

          {localSettings.preloader?.enabled && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Style</label>
                <select
                  value={localSettings.preloader.style}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    preloader: { 
                      ...prev.preloader!, 
                      style: e.target.value as any 
                    }
                  }))}
                  className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-teal-500"
                >
                  <option value="glassmorphism">Glassmorphism</option>
                  <option value="modern">Modern</option>
                  <option value="minimal">Minimal</option>
                  <option value="elegant">Elegant</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Primary Color</label>
                  <input
                    type="color"
                    value={localSettings.preloader.primaryColor}
                    onChange={(e) => setLocalSettings(prev => ({
                      ...prev,
                      preloader: { 
                        ...prev.preloader!, 
                        primaryColor: e.target.value 
                      }
                    }))}
                    className="w-full h-10 bg-gray-900 border border-gray-700 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Secondary Color</label>
                  <input
                    type="color"
                    value={localSettings.preloader.secondaryColor}
                    onChange={(e) => setLocalSettings(prev => ({
                      ...prev,
                      preloader: { 
                        ...prev.preloader!, 
                        secondaryColor: e.target.value 
                      }
                    }))}
                    className="w-full h-10 bg-gray-900 border border-gray-700 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Background Color</label>
                <input
                  type="color"
                  value={localSettings.preloader.backgroundColor}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    preloader: { 
                      ...prev.preloader!, 
                      backgroundColor: e.target.value 
                    }
                  }))}
                  className="w-full h-10 bg-gray-900 border border-gray-700 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Custom Text</label>
                <input
                  type="text"
                  value={localSettings.preloader.customText || ''}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    preloader: { 
                      ...prev.preloader!, 
                      customText: e.target.value 
                    }
                  }))}
                  placeholder="Loading your moments..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.preloader.showLogo}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        preloader: { 
                          ...prev.preloader!, 
                          showLogo: e.target.checked 
                        }
                      }))}
                      className="w-4 h-4 text-teal-600 bg-gray-900 border-gray-700 rounded focus:ring-teal-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-300">Show Logo</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.preloader.showProgress}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        preloader: { 
                          ...prev.preloader!, 
                          showProgress: e.target.checked 
                        }
                      }))}
                      className="w-4 h-4 text-teal-600 bg-gray-900 border-gray-700 rounded focus:ring-teal-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-300">Show Progress</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Animation Speed</label>
                <select
                  value={localSettings.preloader.animationSpeed}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    preloader: { 
                      ...prev.preloader!, 
                      animationSpeed: e.target.value as any 
                    }
                  }))}
                  className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-teal-500"
                >
                  <option value="slow">Slow</option>
                  <option value="normal">Normal</option>
                  <option value="fast">Fast</option>
                </select>
              </div>
            </>
          )}

          <div className="text-right pt-4">
            <button
              onClick={handlePreloaderSettingsSave}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-md text-white font-semibold transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {isSaving ? <Spinner size="h-5 w-5" /> : 'Save Preloader Settings'}
            </button>
          </div>
        </div>
      </div>
       
       {/* SEO & Tracking */}
      <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700/50">
        <h2 className="text-2xl font-bold mb-4 text-white">SEO & Tracking</h2>
        <div className="space-y-6">
           <div>
            <label htmlFor="gtmId" className="block text-sm font-medium text-gray-300 mb-1">
              Google Tag Manager ID
            </label>
            <input
              id="gtmId"
              name="gtmId"
              type="text"
              placeholder="GTM-XXXXXXX"
              value={localSettings.gtmId}
              onChange={handleSettingsChange}
              className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          {/* AI Features Configuration */}
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-semibold mb-4 text-white">AI Features (Gemini)</h3>
            
            <div className="mb-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="aiEnabled"
                  checked={localSettings.aiEnabled || false}
                  onChange={(e) => setLocalSettings(prev => ({...prev, aiEnabled: e.target.checked}))}
                  className="w-4 h-4 text-teal-600 bg-gray-900 border-gray-700 rounded focus:ring-teal-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-300">
                  Enable AI Features (Auto descriptions, SEO suggestions, Semantic search)
                </span>
              </label>
            </div>

            {localSettings.aiEnabled && (
              <div>
                <label htmlFor="geminiApiKey" className="block text-sm font-medium text-gray-300 mb-1">
                  Gemini API Key <span className="text-red-500">*</span>
                </label>
                <input
                  id="geminiApiKey"
                  name="geminiApiKey"
                  type="password"
                  placeholder="AIza..."
                  value={localSettings.geminiApiKey || ''}
                  onChange={handleSettingsChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Get your API key from{' '}
                  <a 
                    href="https://aistudio.google.com/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-teal-400 hover:text-teal-300 underline"
                  >
                    Google AI Studio
                  </a>
                </p>
              </div>
            )}
          </div>
          
          <SeoManager 
            settings={localSettings.seo}
            onSettingsChange={(newSeo) => setLocalSettings(p => ({ ...p, seo: newSeo }))}
          />

           <div className="text-right pt-4">
            <button
              onClick={handleSeoAndTrackingSave}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-md text-white font-semibold transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {isSaving ? <Spinner size="h-5 w-5" /> : 'Save SEO & Tracking Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;