# 📸 AI Photo Gallery - Gallery2025

Un'applicazione web moderna per la gestione di gallerie fotografiche con **integrazione AI tramite Google Gemini**, storage persistente con **Firebase/Firestore** e gestione cache intelligente tramite **Service Worker**.

## ✨ Caratteristiche

- 🤖 **AI-Powered**: Descrizioni foto automatiche, ricerca semantica, suggerimenti SEO
- ☁️ **Cloud Storage**: Firestore + Cloud Storage per dati persistenti
- 🔄 **Cache Intelligente**: Service Worker con pulizia automatica cache
- 🎨 **Design Moderno**: React 19 + TypeScript + TailwindCSS
- 📱 **Responsive**: Mobile-first design
- 🚀 **Production Ready**: Docker + Cloud Run deployment

---

## 🚀 Quick Start

### Prerequisiti

- Node.js 20+ (raccomandato 22)
- Docker
- Google Cloud SDK
- Account Firebase

### 1. Clone e Installazione

```bash
cd ~/gallery2025-project
npm install
```

### 2. Configurazione Firebase

**IMPORTANTE**: Devi configurare Firebase prima di avviare l'app!

Segui la guida completa: **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)**

In breve:
1. Vai su [Firebase Console](https://console.firebase.google.com/)
2. Seleziona/Importa progetto: `YOUR_PROJECT_ID`
3. Abilita Firestore + Cloud Storage
4. Copia le credenziali in `.env.local`

### 3. Configura `.env.local`

```bash
cp .env.local.example .env.local
nano .env.local
```

Inserisci le tue credenziali:
```env
GEMINI_API_KEY=your-gemini-api-key
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT_ID.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT_ID.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=your-firebase-app-id
```

### 4. Avvia in Locale

```bash
npm run dev
```

Apri: http://localhost:5173

---

## 🐳 Deploy con Docker

### Build Locale

```bash
docker build -t gallery2025 \
  --build-arg VITE_FIREBASE_API_KEY="your-key" \
  --build-arg VITE_FIREBASE_AUTH_DOMAIN="YOUR_PROJECT_ID.firebaseapp.com" \
  --build-arg VITE_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID" \
  --build-arg VITE_FIREBASE_STORAGE_BUCKET="ai-studio-bucket-YOUR_SENDER_ID-us-west1.appspot.com" \
  --build-arg VITE_FIREBASE_MESSAGING_SENDER_ID="YOUR_SENDER_ID" \
  --build-arg VITE_FIREBASE_APP_ID="your-app-id" \
  .
```

### Run Locale

```bash
docker run -d -p 3000:3000 \
  -e GEMINI_API_KEY="your-gemini-key" \
  --name gallery2025 \
  gallery2025
```

Accedi a: http://localhost:3000  # Server produzione

---

## ☁️ Deploy su Google Cloud Run

```bash
gcloud run deploy ai-photo-gallery \
  --source=. \
  --project=YOUR_PROJECT_ID \
  --region=us-west1 \
  --set-env-vars="GEMINI_API_KEY=your-key,VITE_FIREBASE_API_KEY=your-firebase-key,..."
```

URL: https://ai-photo-gallery-YOUR_SENDER_ID.us-west1.run.app

---

## 📁 Struttura Progetto

```
gallery2025-project/
├── components/          # Componenti React riutilizzabili
├── context/            # State management (AppContext)
├── hooks/              # Custom React hooks
├── pages/              # Pagine principali (AlbumList, AlbumView, Admin)
├── services/           # Servizi (bucketService, geminiService)
├── server/             # Server Node.js (proxy Gemini API)
├── public/             # File statici + Service Worker
├── firebaseConfig.ts   # Configurazione Firebase
├── types.ts            # TypeScript definitions
└── vite.config.ts      # Configurazione Vite
```

---

## 🔑 Funzionalità Principali

### 1. Gestione Album e Foto
- Crea, modifica, elimina album
- Upload foto con titoli personalizzati
- Riordina foto con drag & drop
- Lightbox con navigazione tastiera

### 2. AI Features (Google Gemini)
- **Descrizioni automatiche**: L'AI analizza ogni foto caricata
- **Ricerca semantica**: Cerca per significato, non solo keyword
- **Suggerimenti SEO**: Meta tags ottimizzati automaticamente

### 3. Storage Persistente
- **Firestore**: Config, albums, metadata
- **Cloud Storage**: File immagini
- **Nessun LocalStorage**: Tutto su cloud!

### 4. Service Worker
- Cache intelligente per performance
- Pulizia automatica cache quando l'admin aggiorna
- Offline support (fallback)

### 5. Admin Panel
- Gestione completa sito
- Upload foto con preview
- Configurazione SEO e GTM
- Logo personalizzato

---

## 🛠️ Comandi Utili

```bash
# Sviluppo
npm run dev          # Avvia dev server (porta 5173)
npm run build        # Build per produzione

# Docker
docker build -t gallery2025 .
docker run -p 3000:3000 gallery2025
docker logs gallery2025
docker stop gallery2025

# Google Cloud
gcloud config set project YOUR_PROJECT_ID
gcloud run services list
gcloud run deploy ai-photo-gallery --source=.
```

---

## 🔧 Troubleshooting

### Firebase non funziona
- Verifica che Firestore sia abilitato
- Controlla le regole di sicurezza (vedi FIREBASE_SETUP.md)
- Verifica `.env.local` con credenziali corrette

### Service Worker non si registra
- Controlla `/public/service-worker.js` esiste
- Verifica Console browser per errori
- HTTPS richiesto in produzione (Cloud Run OK)

### Errore upload foto
- Verifica regole Cloud Storage
- Controlla che il bucket esista
- Verifica autenticazione Firebase

---

## 📚 Documentazione

- **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** - Setup Firebase completo
- **[Dockerfile](./Dockerfile)** - Configurazione Docker
- **[vite.config.ts](./vite.config.ts)** - Configurazione build

---

## 🔐 Sicurezza

⚠️ **Importante**: Le regole Firestore/Storage attuali permettono accesso pubblico.

Per produzione, implementa:
1. Firebase Authentication
2. Regole Firestore per utenti autenticati
3. Regole Storage per upload sicuri

Vedi sezione "Sicurezza" in FIREBASE_SETUP.md

---

## 📊 Costi Stimati (piccola galleria)

- **Firestore**: 50K letture gratis/giorno → ~$0/mese
- **Cloud Storage**: $0.02/GB/mese → ~$0.20/mese per 10GB
- **Cloud Run**: Pay-per-use → ~$1-5/mese
- **Gemini API**: 15 req/min gratis → $0 con uso moderato

**Totale**: ~$1-6/mese per piccolo sito

---

## 🤝 Contributing

Miglioramenti benvenuti! Areas da sviluppare:

- [ ] Autenticazione multi-utente
- [ ] Compressione automatica immagini
- [ ] Export album in PDF
- [ ] Condivisione social
- [ ] Watermarking automatico
- [ ] Backup automatici

---

## 📄 License

Questo progetto è basato su Google AI Studio template.

---

## 🆘 Support

Per problemi o domande:
1. Controlla [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
2. Verifica logs Cloud Run: `gcloud logging read ...`
3. Ispeziona Service Worker: DevTools → Application

---

**Fatto con ❤️ usando React, Firebase, Gemini AI**
