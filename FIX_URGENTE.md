# 🚨 FIX URGENTE - Due Problemi Critici

## 🐛 PROBLEMA 1: index.tsx 404
L'app sta ancora cercando `/index.tsx` invece del file compilato.

## 🐛 PROBLEMA 2: LocalStorage Quota Exceeded  
L'app sta usando il VECCHIO codice con LocalStorage, NON Firebase!

---

## ✅ SOLUZIONE IMMEDIATA

### **1. PULISCI COMPLETAMENTE LA CACHE BROWSER**

**Chrome/Edge**:
1. Apri DevTools (F12)
2. Click **destro** su pulsante Reload ⟳
3. Seleziona **"Empty Cache and Hard Reload"**

**O meglio**:
1. DevTools (F12) → Tab **"Application"**
2. A sinistra: **"Storage"** → **"Clear site data"**
3. Seleziona TUTTO:
   - Local Storage ✓
   - Session Storage ✓
   - IndexedDB ✓
   - Cache Storage ✓
   - Service Workers ✓
4. Click **"Clear site data"**
5. **CHIUDI** completamente il browser
6. **RIAPRI** il browser
7. Vai su: https://ai-photo-gallery-YOUR_SENDER_ID.us-west1.run.app

---

### **2. VERIFICA QUALE REVISION È LIVE**

Probabilmente stai vedendo una revision VECCHIA (prima della migrazione Firebase).

```bash
gcloud run revisions list \
  --service=ai-photo-gallery \
  --region=us-west1 \
  --project=YOUR_PROJECT_ID \
  --limit=3
```

Se vedi che il traffico non è al 100% sull'ultima revision, forza l'aggiornamento.

---

## 🔍 DIAGNOSI

### **Errore LocalStorage**
```
Error saving to localStorage
QuotaExceededError: Setting the value of 'aiPhotoGalleryBucket' exceeded the quota
```

Questo errore indica che:
- ❌ Sta usando `services/bucketService.ts` VECCHIO (LocalStorage)
- ❌ NON sta usando la versione con Firebase

### **Possibili Cause**
1. Service Worker ha cachato la vecchia versione
2. Browser cache ha la versione vecchia
3. Cloud Run sta servendo una revision vecchia

---

## 🔧 FIX COMPLETO

### **Step 1: Verifica Build Locale**

```bash
cd ~/gallery2025-project
grep -n "localStorage\|LocalStorage" services/bucketService.ts
```

**Dovrebbe restituire**: NESSUN risultato (se il file usa Firebase)

Se trova "localStorage", significa che il file non è stato aggiornato!

### **Step 2: Verifica File Firebase**

```bash
cd ~/gallery2025-project
head -20 services/bucketService.ts
```

Dovrebbe mostrare:
```typescript
import { db, storage } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
```

### **Step 3: Rebuild Completo**

```bash
cd ~/gallery2025-project
rm -rf dist node_modules
npm install
npm run build
```

### **Step 4: Verifica dist/assets/main-*.js**

```bash
cd ~/gallery2025-project
grep -o "localStorage" dist/assets/main-*.js | wc -l
```

Se restituisce un numero > 0, il codice vecchio è ancora nel build!

---

## 🚀 REDEPLOY FORZATO

Se il problema persiste, fai un redeploy COMPLETO:

```bash
cd ~/gallery2025-project

# 1. Pulisci tutto
rm -rf dist node_modules .vite

# 2. Rebuild
npm install
npm run build

# 3. Verifica che dist/index.html sia corretto
cat dist/index.html | grep "script.*src"
# Dovrebbe mostrare: /assets/main-*.js (NON index.tsx)

# 4. Redeploy
gcloud run deploy ai-photo-gallery \
  --source=. \
  --project=YOUR_PROJECT_ID \
  --region=us-west1 \
  --allow-unauthenticated \
  --set-env-vars="GEMINI_API_KEY=PLACEHOLDER_API_KEY,VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY_HERE,VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT_ID.firebaseapp.com,VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID,VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT_ID.firebasestorage.app,VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID,VITE_FIREBASE_APP_ID=1:YOUR_SENDER_ID:web:209c59e241883bf96f633c"
```

---

## 🧪 TEST DOPO IL FIX

1. **Cancella cache browser** (vedi sopra)
2. **Apri**: https://ai-photo-gallery-YOUR_SENDER_ID.us-west1.run.app
3. **Apri Console** (F12)
4. **Cerca errori**:
   - ❌ NO "index.tsx"
   - ❌ NO "localStorage"
   - ✅ SI "Firestore"
   - ✅ SI "Firebase"

---

## ⚠️ SE ANCORA NON FUNZIONA

Il problema potrebbe essere che il codice sorgente in locale è ancora vecchio.

Verifica che `services/bucketService.ts` contenga:
- ✅ `import { db, storage } from '../firebaseConfig'`
- ✅ `getDoc`, `setDoc` da firestore
- ✅ `uploadBytes`, `getDownloadURL` da storage
- ❌ NO `localStorage.getItem`
- ❌ NO `localStorage.setItem`

Se vedi `localStorage`, il file NON è stato migrato!


