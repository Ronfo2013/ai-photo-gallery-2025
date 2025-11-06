# 🎯 Setup Ambiente di Staging

## 🚀 Ambiente di Staging Separato

### **Perché Staging?**
- ✅ Test in ambiente cloud reale
- ✅ Nessun impatto su produzione
- ✅ Deploy più frequenti senza rischi
- ✅ Test con dati reali ma isolati

---

## 🛠️ Setup Staging Environment

### **1. Crea Progetto Firebase Staging**

```bash
# Crea nuovo progetto Firebase per staging
firebase projects:create gallery-staging-2025

# Configura progetto staging
firebase use gallery-staging-2025
firebase init
```

### **2. Configura Cloud Run Staging**

```bash
# Deploy su Cloud Run con nome diverso
gcloud run deploy ai-photo-gallery-staging \
  --source . \
  --region us-west1 \
  --allow-unauthenticated \
  --set-env-vars "VITE_FIREBASE_PROJECT_ID=gallery-staging-2025,VITE_FIREBASE_AUTH_DOMAIN=gallery-staging-2025.firebaseapp.com"
```

### **3. Crea File Configurazione Staging**

**`.env.staging`:**
```bash
# Firebase Staging
VITE_FIREBASE_API_KEY=your-staging-api-key
VITE_FIREBASE_AUTH_DOMAIN=gallery-staging-2025.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=gallery-staging-2025
VITE_FIREBASE_STORAGE_BUCKET=gallery-staging-2025.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-staging-sender-id
VITE_FIREBASE_APP_ID=your-staging-app-id

# Gemini API (stessa chiave)
GEMINI_API_KEY=your-gemini-key

# Staging URL
VITE_APP_URL=https://ai-photo-gallery-staging-xxx.run.app
VITE_CUSTOM_DOMAIN=ai-photo-gallery-staging-xxx.run.app
```

---

## 🔄 Workflow con Staging

### **Script Deploy Automatizzati**

**`package.json` aggiornato:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:staging": "vite build --mode staging",
    "deploy:staging": "npm run build:staging && gcloud run deploy ai-photo-gallery-staging --source . --region us-west1",
    "deploy:prod": "npm run build && gcloud run deploy ai-photo-gallery --source . --region us-west1",
    "preview": "vite preview"
  }
}
```

### **Workflow Consigliato:**

```bash
# 1. Sviluppo locale (velocissimo)
npm run dev
# Modifica, testa, ripeti...

# 2. Test su staging (quando feature completa)
npm run deploy:staging
# URL: https://ai-photo-gallery-staging-xxx.run.app

# 3. Deploy produzione (solo quando staging OK)
npm run deploy:prod
# URL: https://ai-photo-gallery-xxx.run.app
```

---

## 🎯 Strategia Branching con Staging

### **Git Workflow:**

```bash
# 1. Feature development
git checkout -b feature/new-feature
# Sviluppo locale con npm run dev

# 2. Push to staging
git push origin feature/new-feature
npm run deploy:staging

# 3. Test staging, poi merge
git checkout main
git merge feature/new-feature
npm run deploy:prod
```

### **Automazione con GitHub Actions (Opzionale):**

**`.github/workflows/deploy.yml`:**
```yaml
name: Deploy

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy-staging:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run deploy:staging

  deploy-production:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run deploy:prod
```

---

## 💡 Alternative Più Semplici

### **Opzione A: Staging nello stesso progetto Firebase**

```bash
# Usa collezioni separate
# Produzione: albums, photos
# Staging: albums_staging, photos_staging

# Modifica temporaneamente il codice:
const COLLECTION_PREFIX = process.env.NODE_ENV === 'staging' ? '_staging' : '';
const albumsCollection = `albums${COLLECTION_PREFIX}`;
```

### **Opzione B: Branch-based deployment**

```bash
# Deploy branch specifici su URL diversi
gcloud run deploy ai-photo-gallery-dev \
  --source . \
  --region us-west1 \
  --tag dev

# URL automatico: https://dev---ai-photo-gallery-xxx.run.app
```

---

## 📊 Confronto Velocità

| Metodo | Tempo Deploy | Uso Consigliato |
|--------|--------------|------------------|
| Locale (npm run dev) | 0.5s | Sviluppo quotidiano |
| Staging | 2-3 min | Test feature complete |
| Produzione | 2-3 min | Release finali |

### **Frequenza Consigliata:**
- **Locale:** Ogni modifica (100+ volte/giorno)
- **Staging:** 2-3 volte/giorno
- **Produzione:** 1 volta/giorno o meno

---

## 🎉 Risultato

**Prima:** Deploy produzione ogni piccola modifica  
**Dopo:** Sviluppo locale + staging + produzione separati  
**Beneficio:** Velocità + sicurezza + qualità









