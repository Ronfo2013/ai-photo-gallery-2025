/**
 * Backup Manager Component - Componente separato per gestire backup
 * 
 * Questo componente è completamente indipendente e può essere aggiunto
 * all'AdminPanel senza modificare il codice esistente.
 */

import React, { useState, useEffect } from 'react';
import * as backupService from '../services/backupService';

interface BackupManagerProps {
    onBackupCreated?: () => void;
    onBackupRestored?: () => void;
}

const BackupManager: React.FC<BackupManagerProps> = ({ 
    onBackupCreated, 
    onBackupRestored 
}) => {
    const [cloudBackups, setCloudBackups] = useState<backupService.BackupInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreatingBackup, setIsCreatingBackup] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);

    // Carica lista backup
    const loadCloudBackups = async () => {
        setIsLoading(true);
        try {
            const backups = await backupService.getCloudBackups();
            setCloudBackups(backups);
        } catch (error) {
            console.error('Error loading cloud backups:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Crea backup cloud
    const handleCreateCloudBackup = async () => {
        if (!confirm('💾 Creare un backup completo su Firebase Storage?')) {
            return;
        }
        
        setIsCreatingBackup(true);
        try {
            await backupService.createCloudBackup();
            alert('✅ Backup cloud creato con successo!');
            await loadCloudBackups();
            onBackupCreated?.();
        } catch (error) {
            console.error('Cloud backup error:', error);
            alert('❌ Errore durante la creazione del backup cloud.');
        } finally {
            setIsCreatingBackup(false);
        }
    };

    // Ripristina da backup cloud
    const handleRestoreCloudBackup = async (backupUrl: string, backupDate: string) => {
        if (!confirm(`⚠️ Ripristinare dal backup del ${backupDate}?\n\nQuesta operazione sovrascriverà tutti i dati attuali.`)) {
            return;
        }
        
        setIsRestoring(true);
        try {
            await backupService.restoreFromCloudBackup(backupUrl);
            alert('✅ Configurazione ripristinata con successo!');
            onBackupRestored?.();
            window.location.reload();
        } catch (error) {
            console.error('Cloud restore error:', error);
            alert('❌ Errore durante il ripristino.');
        } finally {
            setIsRestoring(false);
        }
    };

    // Export locale
    const handleExportLocal = async () => {
        try {
            await backupService.exportLocalBackup();
            alert('✅ Backup locale esportato!');
        } catch (error) {
            console.error('Export error:', error);
            alert('❌ Errore durante l\'esportazione.');
        }
    };

    // Import locale
    const handleImportLocal = async (file: File) => {
        if (!confirm('⚠️ Questo sovrascriverà tutti i dati attuali. Continuare?')) {
            return;
        }
        
        setIsRestoring(true);
        try {
            await backupService.importLocalBackup(file);
            alert('✅ Backup importato con successo!');
            onBackupRestored?.();
            window.location.reload();
        } catch (error) {
            console.error('Import error:', error);
            alert('❌ Errore durante l\'importazione.');
        } finally {
            setIsRestoring(false);
        }
    };

    // Carica backup all'avvio
    useEffect(() => {
        loadCloudBackups();
    }, []);

    return (
        <div className="space-y-4">
            {/* Backup Cloud */}
            <div className="bg-blue-900/20 border border-blue-600/30 rounded-md p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-blue-200 font-medium">☁️ Backup Cloud</h3>
                    <div className="flex gap-2">
                        <button 
                            onClick={loadCloudBackups}
                            disabled={isLoading}
                            className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white disabled:bg-gray-600"
                        >
                            {isLoading ? '🔄' : '🔄 Aggiorna'}
                        </button>
                        <button 
                            onClick={handleCreateCloudBackup}
                            disabled={isCreatingBackup}
                            className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white disabled:bg-gray-600"
                        >
                            {isCreatingBackup ? '⏳ Creando...' : '💾 Crea Backup'}
                        </button>
                    </div>
                </div>
                
                <div className="text-xs text-blue-300/80 mb-3">
                    Backup automatici su Firebase Storage. Ultimi 10 backup disponibili.
                </div>
                
                {cloudBackups.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {cloudBackups.slice(0, 5).map((backup) => (
                            <div key={backup.name} className="flex items-center justify-between bg-blue-800/30 p-2 rounded text-sm">
                                <div>
                                    <div className="text-blue-200">📅 {backup.date}</div>
                                    <div className="text-blue-300/70 text-xs">{backup.name}</div>
                                </div>
                                <button
                                    onClick={() => handleRestoreCloudBackup(backup.url, backup.date)}
                                    disabled={isRestoring}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-3 py-1 rounded text-white text-xs"
                                >
                                    📥 Ripristina
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-blue-300/70 text-sm">Nessun backup cloud disponibile</div>
                )}
            </div>

            {/* Backup Locale */}
            <div className="bg-green-900/20 border border-green-600/30 rounded-md p-4">
                <h3 className="text-green-200 font-medium mb-3">💻 Backup Locale</h3>
                
                <div className="flex gap-3 items-center mb-2">
                    <button 
                        onClick={handleExportLocal}
                        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white text-sm"
                    >
                        📤 Esporta
                    </button>
                    
                    <input 
                        type="file" 
                        accept=".json"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImportLocal(file);
                        }}
                        className="text-sm"
                        disabled={isRestoring}
                    />
                </div>
                
                <div className="text-xs text-green-300/80">
                    Esporta: Scarica backup sul tuo computer. Importa: Carica backup da file.
                </div>
            </div>
        </div>
    );
};

export default BackupManager;
