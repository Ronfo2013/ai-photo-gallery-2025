# Setup Rapido Sottodominio IONOS

## 🚀 Passi Essenziali

### 1. Su IONOS
1. **Pannello Domini** → Seleziona il tuo dominio
2. **Crea Sottodominio** → es: `gallery`
3. **Configura DNS**:
   - **Tipo**: A o CNAME
   - **Nome**: gallery
   - **Valore**: IP del server o dominio Firebase

### 2. Nel Progetto
Crea file `.env` nella root:
```env
# Il tuo dominio personalizzato
VITE_CUSTOM_DOMAIN=https://gallery.tuodominio.com
VITE_APP_URL=https://gallery.tuodominio.com

# Mantieni le tue configurazioni Firebase esistenti
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
# etc...
```

### 3. Deploy
```bash
# Build
npm run build

# Deploy su Firebase
firebase deploy --only hosting

# O copia dist/ sul tuo server
```

## ✅ Risultato
- I link di condivisione mostreranno: `https://gallery.tuodominio.com/album/123`
- I meta tags social useranno il dominio personalizzato
- Funziona sia in sviluppo che in produzione

## 🔧 File Modificati
- ✅ `utils/urlUtils.ts` - Gestione URL personalizzati
- ✅ `components/AlbumCard.tsx` - Link condivisione
- ✅ `pages/AlbumView.tsx` - Link condivisione
- ✅ `components/AlbumMetaTags.tsx` - Meta tags social
- ✅ `vite.config.ts` - Variabili d'ambiente

## 📋 Test
1. Vai su `https://gallery.tuodominio.com`
2. Apri un album
3. Clicca "Condividi"
4. Verifica che il link mostri il tuo dominio

## ❓ Problemi?
- **DNS non risolve**: Aspetta 24-48h per propagazione
- **Link ancora vecchi**: Svuota cache browser
- **Errori build**: Controlla variabili `.env`

Per la guida completa vedi: `GUIDA_SOTTODOMINIO_IONOS.md`


