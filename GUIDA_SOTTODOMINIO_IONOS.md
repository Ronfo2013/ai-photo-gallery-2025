# Guida: Configurazione Sottodominio IONOS per Gallery 2025

## 1. Configurazione Sottodominio su IONOS

### Passo 1: Accesso al Pannello IONOS
1. Accedi al tuo account IONOS
2. Vai nella sezione **Domini** o **DNS**
3. Seleziona il tuo dominio principale

### Passo 2: Creazione del Sottodominio
1. Cerca l'opzione **"Sottodomini"** o **"Subdomain"**
2. Clicca su **"Crea nuovo sottodominio"**
3. Inserisci il nome del sottodominio (es: `gallery`, `foto`, `albums`)
4. Il risultato sarà: `gallery.tuodominio.com`

### Passo 3: Configurazione DNS
Devi puntare il sottodominio al tuo hosting. Hai due opzioni:

#### Opzione A: Hosting su Firebase (Consigliato)
```bash
# 1. Installa Firebase CLI se non l'hai già fatto
npm install -g firebase-tools

# 2. Accedi a Firebase
firebase login

# 3. Configura il dominio personalizzato
firebase hosting:channel:deploy live --project tuo-project-id
```

Poi nel pannello Firebase Console:
1. Vai su **Hosting**
2. Clicca **"Aggiungi dominio personalizzato"**
3. Inserisci il tuo sottodominio: `gallery.tuodominio.com`
4. Firebase ti darà dei record DNS da configurare

#### Opzione B: Server Personalizzato
Se usi un server personalizzato, configura questi record DNS su IONOS:

```
Tipo: A
Nome: gallery (o il nome del tuo sottodominio)
Valore: IP_DEL_TUO_SERVER
TTL: 3600
```

oppure

```
Tipo: CNAME
Nome: gallery
Valore: tuoserver.com
TTL: 3600
```

## 2. Configurazione del Progetto per il Dominio Personalizzato

### Passo 1: Variabili d'Ambiente
Crea/modifica il file `.env` nella root del progetto:

```env
# Dominio personalizzato
VITE_CUSTOM_DOMAIN=https://gallery.tuodominio.com
VITE_APP_URL=https://gallery.tuodominio.com

# Firebase (mantieni le tue configurazioni esistenti)
VITE_FIREBASE_API_KEY=tua_api_key
VITE_FIREBASE_AUTH_DOMAIN=tuo_auth_domain
VITE_FIREBASE_PROJECT_ID=tuo_project_id
VITE_FIREBASE_STORAGE_BUCKET=tuo_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tuo_sender_id
VITE_FIREBASE_APP_ID=tuo_app_id
```

### Passo 2: Configurazione Vite
Modifica `vite.config.ts` per supportare il dominio personalizzato:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.VITE_CUSTOM_DOMAIN': JSON.stringify(process.env.VITE_CUSTOM_DOMAIN),
    'process.env.VITE_APP_URL': JSON.stringify(process.env.VITE_APP_URL)
  },
  server: {
    host: true,
    port: 3000
  }
})
```

## 3. Modifica dei Link di Condivisione

I link di condivisione attualmente usano `window.location.origin`. Per personalizzarli con il tuo dominio, devi modificare i componenti che generano questi link.

### File da Modificare:

1. **components/AlbumCard.tsx** (riga 14)
2. **pages/AlbumView.tsx** (riga 23)

### Implementazione:

Crea un file di utilità per gestire l'URL base:

```typescript
// utils/urlUtils.ts
export const getBaseUrl = (): string => {
  // In produzione, usa il dominio personalizzato se disponibile
  if (import.meta.env.PROD && import.meta.env.VITE_CUSTOM_DOMAIN) {
    return import.meta.env.VITE_CUSTOM_DOMAIN;
  }
  
  // In sviluppo o come fallback, usa window.location.origin
  return window.location.origin;
};

export const getShareUrl = (albumId: string): string => {
  return `${getBaseUrl()}/album/${albumId}`;
};
```

## 4. Deploy e Verifica

### Per Firebase Hosting:
```bash
# Build del progetto
npm run build

# Deploy
firebase deploy --only hosting

# Verifica che il dominio personalizzato funzioni
# Vai su: https://gallery.tuodominio.com
```

### Per Server Personalizzato:
```bash
# Build del progetto
npm run build

# Copia i file della cartella dist/ sul tuo server
# Assicurati che il server sia configurato per servire file statici
```

## 5. Test dei Link di Condivisione

1. Vai sul tuo sito: `https://gallery.tuodominio.com`
2. Apri un album
3. Clicca sul pulsante di condivisione
4. Verifica che il link mostri il tuo dominio personalizzato
5. Testa che il link funzioni quando condiviso

## 6. Configurazioni Aggiuntive

### Meta Tags per Social Sharing
Assicurati che i meta tags usino il dominio personalizzato per una migliore condivisione sui social:

```html
<meta property="og:url" content="https://gallery.tuodominio.com/album/ID_ALBUM" />
<meta property="og:image" content="URL_IMMAGINE_COPERTINA" />
<meta property="og:title" content="Nome Album - Gallery" />
```

### SSL/HTTPS
- IONOS di solito fornisce certificati SSL gratuiti
- Assicurati che sia attivato per il sottodominio
- Firebase Hosting include automaticamente SSL

## 7. Risoluzione Problemi Comuni

### Il sottodominio non si risolve:
- Aspetta 24-48 ore per la propagazione DNS
- Verifica i record DNS nel pannello IONOS
- Usa strumenti come `nslookup` o `dig` per testare

### Link di condivisione ancora con dominio vecchio:
- Svuota la cache del browser
- Verifica che le variabili d'ambiente siano caricate correttamente
- Controlla che il build includa le modifiche

### Errori CORS:
- Configura Firebase per accettare richieste dal nuovo dominio
- Aggiorna le regole di sicurezza se necessario

## Esempio Completo

Se il tuo dominio è `miosito.com` e vuoi creare `gallery.miosito.com`:

1. **IONOS**: Crea sottodominio `gallery`
2. **DNS**: Punta a Firebase o al tuo server
3. **Progetto**: Imposta `VITE_CUSTOM_DOMAIN=https://gallery.miosito.com`
4. **Deploy**: I link di condivisione mostreranno `gallery.miosito.com/album/123`

## Supporto

Se hai problemi:
1. Controlla i log del browser (F12 → Console)
2. Verifica la propagazione DNS con strumenti online
3. Testa prima in locale con `npm run dev`
4. Controlla la documentazione IONOS per il tuo piano specifico
