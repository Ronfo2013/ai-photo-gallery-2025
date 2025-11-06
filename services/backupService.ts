/**
 * Backup Service - Sistema di backup separato e sicuro
 * 
 * Questo file è completamente indipendente e non modifica nessun file esistente.
 * Fornisce funzionalità di backup e restore per la configurazione della gallery.
 */

import { storage } from '../firebaseConfig';
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import * as bucketService from './bucketService';

// Tipi per il backup
export interface BackupData {
    timestamp: string;
    version: string;
    source: string;
    config: any;
    metadata: {
        albumsCount: number;
        photosCount: number;
        appName: string;
    };
}

export interface BackupInfo {
    name: string;
    date: string;
    url: string;
    size?: number;
}

/**
 * Crea backup su Firebase Storage
 */
export const createCloudBackup = async (): Promise<string> => {
    try {
        console.log('💾 Creating cloud backup...');
        
        // Usa la funzione esistente per ottenere config (senza modificarla)
        const config = await bucketService.getConfig();
        
        // Crea oggetto backup
        const backup: BackupData = {
            timestamp: new Date().toISOString(),
            version: '1.0',
            source: 'cloud-backup',
            config: config,
            metadata: {
                albumsCount: config.albums.length,
                photosCount: config.albums.reduce((total, album) => total + album.photos.length, 0),
                appName: config.siteSettings.appName
            }
        };
        
        // Nome file con timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFileName = `backups/config-backup-${timestamp}.json`;
        
        // Converti in blob
        const backupBlob = new Blob([JSON.stringify(backup, null, 2)], {
            type: 'application/json'
        });
        
        // Upload su Firebase Storage
        const backupRef = ref(storage, backupFileName);
        await uploadBytes(backupRef, backupBlob);
        
        // Ottieni URL
        const backupUrl = await getDownloadURL(backupRef);
        
        console.log(`✅ Cloud backup created: ${backupFileName}`);
        
        // Pulizia backup vecchi (mantieni ultimi 10)
        await cleanupOldCloudBackups();
        
        return backupUrl;
        
    } catch (error) {
        console.error('❌ Cloud backup failed:', error);
        throw error;
    }
};

/**
 * Ottieni lista backup cloud
 */
export const getCloudBackups = async (): Promise<BackupInfo[]> => {
    try {
        const backupsRef = ref(storage, 'backups/');
        const backupsList = await listAll(backupsRef);
        
        const backups = await Promise.all(
            backupsList.items
                .filter(item => item.name.startsWith('config-backup-'))
                .map(async (item) => {
                    const url = await getDownloadURL(item);
                    
                    // Estrai data dal nome file
                    const dateMatch = item.name.match(/config-backup-(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})/);
                    const date = dateMatch ? 
                        dateMatch[1].replace('T', ' ').replace(/-/g, ':') : 
                        'Unknown';
                    
                    return {
                        name: item.name,
                        date: date,
                        url: url
                    };
                })
        );
        
        // Ordina per data (più recenti prima)
        return backups.sort((a, b) => b.name.localeCompare(a.name));
        
    } catch (error) {
        console.error('Error getting cloud backups:', error);
        return [];
    }
};

/**
 * Ripristina da backup cloud
 */
export const restoreFromCloudBackup = async (backupUrl: string): Promise<void> => {
    try {
        console.log('🔄 Restoring from cloud backup...');
        
        // Scarica backup
        const response = await fetch(backupUrl);
        const backupData: BackupData = await response.json();
        
        // Valida formato backup
        if (!backupData.config || !backupData.config.albums || !backupData.config.siteSettings) {
            throw new Error('Invalid backup format');
        }
        
        // Usa la funzione esistente per salvare (senza modificarla)
        await bucketService.saveConfig(backupData.config);
        
        console.log('✅ Config restored from cloud backup');
        
    } catch (error) {
        console.error('❌ Cloud restore failed:', error);
        throw error;
    }
};

/**
 * Pulizia backup vecchi (mantieni ultimi 10)
 */
const cleanupOldCloudBackups = async (): Promise<void> => {
    try {
        const backupsRef = ref(storage, 'backups/');
        const backupsList = await listAll(backupsRef);
        
        const configBackups = backupsList.items
            .filter(item => item.name.startsWith('config-backup-'))
            .sort((a, b) => a.name.localeCompare(b.name)); // Più vecchi prima
        
        if (configBackups.length > 10) {
            const toDelete = configBackups.slice(0, configBackups.length - 10);
            
            await Promise.all(
                toDelete.map(item => deleteObject(item))
            );
            
            console.log(`🧹 Cleaned up ${toDelete.length} old cloud backups`);
        }
        
    } catch (error) {
        console.warn('⚠️ Backup cleanup failed (non-critical):', error);
    }
};

/**
 * Esporta backup locale (download)
 */
export const exportLocalBackup = async (): Promise<void> => {
    try {
        // Usa la funzione esistente per ottenere config
        const config = await bucketService.getConfig();
        
        const backup: BackupData = {
            timestamp: new Date().toISOString(),
            version: '1.0',
            source: 'manual-export',
            config: config,
            metadata: {
                albumsCount: config.albums.length,
                photosCount: config.albums.reduce((total, album) => total + album.photos.length, 0),
                appName: config.siteSettings.appName
            }
        };
        
        // Download come file
        const blob = new Blob([JSON.stringify(backup, null, 2)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gallery-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('✅ Local backup exported successfully');
    } catch (error) {
        console.error('Export backup failed:', error);
        throw error;
    }
};

/**
 * Importa backup locale
 */
export const importLocalBackup = async (file: File): Promise<void> => {
    try {
        const text = await file.text();
        const backup: BackupData = JSON.parse(text);
        
        // Valida formato
        if (!backup.config || !backup.config.albums || !backup.config.siteSettings) {
            throw new Error('Invalid backup file format');
        }
        
        // Usa la funzione esistente per salvare
        await bucketService.saveConfig(backup.config);
        
        console.log('✅ Config restored from local backup successfully');
    } catch (error) {
        console.error('Import backup failed:', error);
        throw error;
    }
};
