# 🧹 Pulizia Completa Cache + Firestore

## 🐛 PROBLEMA
Ancora 2 errori 403 su picsum.photos nonostante il document sia stato cancellato.

## 🔍 CAUSA
1. **Cache Browser**: Il browser ha salvato i dati vecchi
2. **Service Worker**: Potrebbe aver cachato i dati vecchi
3. **Firestore**: Potrebbe essere stato rigenerato con dati vecchi da cache

## ✅ SOLUZIONE - 3 STEP

### **STEP 1: Hard Refresh Browser**

**Su Mac**:
```
Cmd + Shift + R
```

**Su Windows**:
```
Ctrl + Shift + R
```

**O meglio ancora**:
1. Apri DevTools (F12)
2. Click destro sul pulsante reload (⟳)
3. Seleziona **"Empty Cache and Hard Reload"**

---

### **STEP 2: Cancella Cache Application**

1. Apri l'app: https://ai-photo-gallery-595991638389.us-west1.run.app
2. Premi **F12** (apri DevTools)
3. Vai su tab **"Application"**
4. A sinistra trova:
   - **Storage** → Clear site data
   - **Cache Storage** → Cancella tutto
   - **IndexedDB** → Cancella tutto
5. Click **"Clear site data"**
6. Chiudi e riapri il browser

---

### **STEP 3: Cancella TUTTO da Firestore**

**Opzione A - Cancella Collection Completa**:
```
1. Apri: https://console.firebase.google.com/project/gen-lang-client-0873479092/firestore
2. Click sulla collection "gallery"
3. In alto a destra: tre puntini (⋮) → "Delete collection"
4. Digita "gallery" per confermare
5. Click "Delete"
```

**Opzione B - Cancella Solo Document (se ancora esiste)**:
```
1. Apri: https://console.firebase.google.com/project/gen-lang-client-0873479092/firestore/databases/-default-/data/~2Fgallery~2Fconfig
2. Se vedi il document "config" → Cancellalo di nuovo
3. Click cestino 🗑️
```

---

### **STEP 4: Verifica Deploy Attuale**

Potrebbe essere che stai guardando un deploy vecchio. Verifichiamo:

```bash
gcloud run revisions list \
  --service=ai-photo-gallery \
  --region=us-west1 \
  --project=gen-lang-client-0873479092 \
  --limit=1
```

Dovrebbe mostrare: `ai-photo-gallery-00005-xxx`

---

## 🧪 TEST FINALE

Dopo aver fatto tutti gli step:

1. **Chiudi completamente il browser**
2. **Riapri il browser**
3. **Apri l'app**:
   ```
   https://ai-photo-gallery-595991638389.us-west1.run.app
   ```
4. **Apri Console (F12) → Tab Network**
5. **Filtra per "picsum"** → Dovrebbe essere **VUOTO**

---

## 🔍 DEBUG: Trova gli Errori

Per capire esattamente DOVE sono questi 2 errori:

1. Apri l'app
2. Apri Console Browser (F12)
3. Tab **"Network"**
4. Ricarica (Cmd+R)
5. Cerca richieste con Status **403** o **600**
6. Guarda quale URL viene chiamato

Probabilmente vedrai:
```
❌ https://picsum.photos/seed/qualcosa/800/600
```

Dimmi ESATTAMENTE quale URL vedi, così posso cercare da dove viene!

---

## 🚨 SE ANCORA NON FUNZIONA

Potrebbe essere che i dati sono hardcoded da qualche altra parte. Fammi sapere:

1. **Quale URL esatto** mostra errore 403/600?
2. **In quale pagina** sei quando vedi l'errore? (Homepage, Admin, Album?)
3. **Screenshot della console** se possibile

---

## 🔧 SOLUZIONE NUCLEARE (se niente funziona)

Rebuild + Redeploy completo:

```bash
cd ~/gallery2025-project

# 1. Pulisci tutto
rm -rf node_modules dist .vite

# 2. Reinstalla
npm install

# 3. Rebuild
npm run build

# 4. Redeploy
gcloud run deploy ai-photo-gallery \
  --source=. \
  --project=gen-lang-client-0873479092 \
  --region=us-west1 \
  --allow-unauthenticated \
  --set-env-vars="GEMINI_API_KEY=PLACEHOLDER_API_KEY,VITE_FIREBASE_API_KEY=AIzaSyBzexnXOj4uAix3d2lZ8wZ57TRC5OaJKfs,VITE_FIREBASE_AUTH_DOMAIN=gen-lang-client-0873479092.firebaseapp.com,VITE_FIREBASE_PROJECT_ID=gen-lang-client-0873479092,VITE_FIREBASE_STORAGE_BUCKET=gen-lang-client-0873479092.firebasestorage.app,VITE_FIREBASE_MESSAGING_SENDER_ID=595991638389,VITE_FIREBASE_APP_ID=1:595991638389:web:209c59e241883bf96f633c"
```

Poi cancella Firestore e cache browser di nuovo.


