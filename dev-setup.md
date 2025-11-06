# 🔥 Setup Sviluppo Locale Veloce

## 🚀 Sviluppo Locale con Hot Reload

### **Configurazione Ambiente Locale**

1. **Crea file `.env.local` per sviluppo:**
```bash
# Firebase (usa le stesse credenziali di produzione)
VITE_FIREBASE_API_KEY=AIzaSyBzexnXOj4uAix3d2lZ8wZ57TRC5OaJKfs
VITE_FIREBASE_AUTH_DOMAIN=gen-lang-client-0873479092.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=gen-lang-client-0873479092
VITE_FIREBASE_STORAGE_BUCKET=gen-lang-client-0873479092.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=595991638389
VITE_FIREBASE_APP_ID=1:595991638389:web:209c59e241883bf96f633c

# Gemini API (opzionale per sviluppo)
GEMINI_API_KEY=your-dev-key-here

# Sviluppo locale
VITE_APP_URL=http://localhost:5173
VITE_CUSTOM_DOMAIN=localhost:5173
```

2. **Avvia sviluppo locale:**
```bash
cd /Users/angelo-mac/gallery2025-project

# Installa dipendenze (solo la prima volta)
npm install

# Avvia server di sviluppo con hot reload
npm run dev
```

3. **Accedi all'app:**
- Frontend: http://localhost:5173
- Hot reload automatico su ogni modifica
- Usa Firebase di produzione per dati e storage
- Nessun deploy necessario durante sviluppo!

### **Vantaggi:**
- ⚡ **Modifiche istantanee** (< 1 secondo)
- 🔥 **Hot reload** automatico
- 🎯 **Stesso database** di produzione
- 💾 **Nessun build** necessario
- 🚀 **Deploy solo quando finito**

---

## 🎯 Workflow Consigliato

### **Durante Sviluppo:**
```bash
# 1. Avvia una volta
npm run dev

# 2. Modifica codice in Cursor
# 3. Salva file (Cmd+S)
# 4. Browser si aggiorna automaticamente
# 5. Ripeti 2-4 all'infinito
```

### **Quando Sei Soddisfatto:**
```bash
# 1. Test finale locale
npm run build
npm run preview  # Test build di produzione

# 2. Deploy su Cloud Run (solo quando necessario)
gcloud run deploy ai-photo-gallery \
  --source . \
  --region us-west1 \
  --allow-unauthenticated
```

---

## 🛠️ Setup Avanzato con Proxy

Se hai problemi CORS o vuoi simulare meglio produzione:

### **Crea `vite.config.dev.ts`:**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      // Proxy per API esterne se necessario
      '/api': {
        target: 'https://your-cloud-run-url.run.app',
        changeOrigin: true,
        secure: true
      }
    }
  },
  // ... resto della configurazione
});
```

### **Script package.json aggiornato:**
```json
{
  "scripts": {
    "dev": "vite --config vite.config.dev.ts",
    "dev:prod": "vite --config vite.config.ts --mode production",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## 🔄 Sincronizzazione con Produzione

### **Per sincronizzare dati da produzione:**
```bash
# Esporta dati da Firestore produzione
firebase firestore:export gs://your-bucket/backups/$(date +%Y%m%d)

# Importa in ambiente locale (se usi emulatori)
firebase emulators:start --import ./firebase-export
```

### **Per testare con dati reali:**
- Usa direttamente Firebase di produzione
- Crea collezione separata per test (es. `albums_dev`)
- Modifica temporaneamente il codice per usare collezioni dev

---

## ⚠️ Note Importanti

1. **Firebase Emulators (Opzionale):**
   ```bash
   # Se vuoi ambiente completamente isolato
   npm install -g firebase-tools
   firebase emulators:start
   ```

2. **Variabili Ambiente:**
   - `.env.local` per sviluppo locale
   - `.env.production` per Cloud Run
   - Vite carica automaticamente il file giusto

3. **Hot Reload Funziona Con:**
   - ✅ Modifiche React components
   - ✅ Modifiche CSS/styling
   - ✅ Modifiche TypeScript
   - ✅ Modifiche configurazione Vite
   - ❌ Modifiche variabili ambiente (richiede restart)

4. **Performance:**
   - Primo avvio: ~3-5 secondi
   - Hot reload: ~200-500ms
   - Vs Cloud Run deploy: ~2-5 minuti

---

## 🎉 Risultato

**Prima:** Deploy Cloud Run ogni modifica = 2-5 minuti  
**Dopo:** Hot reload locale = 200-500ms  
**Miglioramento: 240-1500x più veloce!** 🚀

