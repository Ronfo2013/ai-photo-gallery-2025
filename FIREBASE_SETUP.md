# 🔥 Configurazione Firebase per Gallery2025

## Prerequisiti

- Account Google Cloud/Firebase
- Progetto Google Cloud: `YOUR_PROJECT_ID`

---

## 📝 Passo 1: Configurare Firebase Console

### 1.1 Accedi a Firebase Console
```
https://console.firebase.google.com/
```

### 1.2 Seleziona/Aggiungi il Progetto
- Se il progetto `YOUR_PROJECT_ID` non è ancora su Firebase:
  - Click su "Aggiungi progetto"
  - Seleziona "Importa progetto Google Cloud"
  - Scegli `YOUR_PROJECT_ID`
  
- Se esiste già, selezionalo

### 1.3 Abilita Firestore
1. Nel menu laterale, vai su **Build > Firestore Database**
2. Click su **Create database**
3. Seleziona modalità:
   - **Produzione**: Regole di sicurezza rigorose (consigliato)
   - **Test**: Accesso aperto per 30 giorni
4. Scegli la location: `us-west1` (stessa del bucket)
5. Click **Enable**

### 1.4 Configura Cloud Storage
1. Nel menu laterale, vai su **Build > Storage**
2. Click su **Get started**
3. Scegli le regole di sicurezza:
   - **Produzione**: Solo utenti autenticati
   - **Test**: Accesso aperto temporaneo
4. Location: usa `us-west1` (già esistente: `ai-studio-bucket-YOUR_SENDER_ID-us-west1`)
5. Click **Done**

---

## 🔑 Passo 2: Ottenere le Credenziali Firebase

### 2.1 Vai su Project Settings
1. Click sull'icona ingranaggio ⚙️ → **Project settings**
2. Scorri fino a **Your apps**

### 2.2 Aggiungi Web App (se non esiste)
1. Click sull'icona web `</>`
2. Registra l'app con nome: `Gallery2025`
3. NON abilitare Firebase Hosting (per ora)
4. Click **Register app**

### 2.3 Copia la Configurazione
Vedrai qualcosa del tipo:

```javascript
const firebaseConfig = {
  apiKey: "AIza....",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "ai-studio-bucket-YOUR_SENDER_ID-us-west1.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "1:YOUR_SENDER_ID:web:xxxxx"
};
```

---

## 🛠️ Passo 3: Configurare l'Applicazione Locale

### 3.1 Aggiorna `.env.local`
```bash
cd ~/gallery2025-project
nano .env.local
```

Inserisci i valori da Firebase Console:
```env
GEMINI_API_KEY=tua-chiave-gemini

VITE_FIREBASE_API_KEY=AIza....
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT_ID.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT_ID.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=1:YOUR_SENDER_ID:web:xxxxx
```

### 3.2 Configura le Regole Firestore
Nel Firebase Console → Firestore → Rules, usa:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permetti lettura/scrittura per tutti (per ora)
    // TODO: Aggiungi autenticazione in futuro
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 3.3 Configura le Regole Storage
Nel Firebase Console → Storage → Rules, usa:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      // Permetti lettura pubblica, scrittura per tutti (per ora)
      allow read: if true;
      allow write: if true;
    }
  }
}
```

---

## 🚀 Passo 4: Deploy su Cloud Run

### 4.1 Build Docker con Firebase Config
```bash
docker build \
  --build-arg VITE_FIREBASE_API_KEY="AIza...." \
  --build-arg VITE_FIREBASE_AUTH_DOMAIN="YOUR_PROJECT_ID.firebaseapp.com" \
  --build-arg VITE_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID" \
  --build-arg VITE_FIREBASE_STORAGE_BUCKET="YOUR_PROJECT_ID.appspot.com" \
  --build-arg VITE_FIREBASE_MESSAGING_SENDER_ID="YOUR_SENDER_ID" \
  --build-arg VITE_FIREBASE_APP_ID="1:YOUR_SENDER_ID:web:xxxxx" \
  -t gallery2025-firebase .
```

### 4.2 Deploy con gcloud
```bash
gcloud run deploy ai-photo-gallery \
  --source=. \
  --project=YOUR_PROJECT_ID \
  --region=us-west1 \
  --set-env-vars="GEMINI_API_KEY=tua-chiave-gemini" \
  --set-env-vars="VITE_FIREBASE_API_KEY=AIza...." \
  --set-env-vars="VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT_ID.firebaseapp.com" \
  --set-env-vars="VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID" \
  --set-env-vars="VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT_ID.appspot.com" \
  --set-env-vars="VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID" \
  --set-env-vars="VITE_FIREBASE_APP_ID=1:YOUR_SENDER_ID:web:xxxxx"
```

---

## ✅ Passo 5: Verifica

### 5.1 Test Locale
```bash
cd ~/gallery2025-project
npm run dev
```

Apri http://localhost:5173 e:
1. Vai su Admin Panel
2. Carica una foto
3. Verifica su Firebase Console → Storage che il file sia stato caricato
4. Verifica su Firebase Console → Firestore che la config sia salvata

### 5.2 Test Produzione
```bash
# Apri l'app deployata
open https://ai-photo-gallery-YOUR_SENDER_ID.us-west1.run.app
```

### 5.3 Test Service Worker
1. Apri Chrome DevTools → Application → Service Workers
2. Verifica che sia registrato: `/service-worker.js`
3. Vai su Admin Panel e modifica qualcosa
4. Verifica nella Console: "Cache cleared at: ..."

---

## 🔒 Sicurezza (TODO Futuro)

### Implementare Autenticazione
```bash
# Abilita Firebase Authentication
# Firebase Console → Build → Authentication → Get started
```

### Aggiornare Regole Firestore
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /gallery/{document=**} {
      allow read: if true; // Pubblico
      allow write: if request.auth != null; // Solo autenticati
    }
  }
}
```

### Aggiornare Regole Storage
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /uploads/{allPaths=**} {
      allow read: if true; // Pubblico
      allow write: if request.auth != null; // Solo autenticati
    }
  }
}
```

---

## 📊 Monitoring

### Firestore Usage
```
Firebase Console → Firestore Database → Usage
```

### Storage Usage
```
Firebase Console → Storage → Usage
```

### Cloud Run Logs
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=ai-photo-gallery" --limit 50 --project=YOUR_PROJECT_ID
```

---

## 🐛 Troubleshooting

### Errore: "Firebase: Error (auth/api-key-not-valid)"
- Verifica che `VITE_FIREBASE_API_KEY` sia corretto
- Controlla che l'API key sia abilitata su Google Cloud Console

### Errore: "storage/unauthorized"
- Verifica le regole di Storage
- Controlla che il bucket sia corretto

### Errore: "Firestore permission denied"
- Verifica le regole di Firestore
- Controlla di aver abilitato Firestore nel progetto

### Service Worker non si registra
- Controlla che il file sia in `/public/service-worker.js`
- Verifica nella DevTools → Console per errori
- HTTPS è richiesto in produzione (Cloud Run lo fornisce automaticamente)

---

## 📚 Risorse

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Service Workers MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

