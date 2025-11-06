# Setup Sottodominio IONOS per Cloud Run

## 🎯 Il Tuo Setup Attuale

- **Frontend**: Google Cloud Run
- **URL attuale**: `https://ai-photo-gallery-595991638389.us-west1.run.app`
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage

## 📋 Passi per Sottodominio IONOS

### 1. Su IONOS - Crea Sottodominio
1. **Pannello IONOS** → Domini
2. **Crea sottodominio**: `gallery` 
3. **Risultato**: `gallery.tuodominio.com`

### 2. Su IONOS - Configura DNS
```
Tipo: CNAME
Nome: gallery
Valore: ghs.googlehosted.com
TTL: 3600
```

**OPPURE** (se CNAME non funziona):
```
Tipo: A
Nome: gallery
Valore: 216.239.32.21
TTL: 3600
```

### 3. Su Google Cloud - Configura Dominio Personalizzato

#### Opzione A: Via Console Web
1. Vai a: https://console.cloud.google.com/run
2. Seleziona il servizio `ai-photo-gallery`
3. Tab **"NETWORKING"**
4. **"Manage Custom Domains"**
5. **"Add Mapping"**
6. Domain: `gallery.tuodominio.com`
7. Service: `ai-photo-gallery`
8. Segui le istruzioni per verificare il dominio

#### Opzione B: Via Command Line
```bash
# Mappa il dominio al servizio Cloud Run
gcloud run domain-mappings create \
  --service ai-photo-gallery \
  --domain gallery.tuodominio.com \
  --region us-west1
```

### 4. Verifica Dominio (Google Search Console)
1. Vai a: https://search.google.com/search-console
2. **"Add Property"** → `gallery.tuodominio.com`
3. **Verify ownership** (DNS TXT record)
4. Aggiungi il record TXT su IONOS

### 5. SSL Automatico
Google Cloud Run configurerà automaticamente il certificato SSL per il tuo dominio.

## ✅ Risultato

Dopo 24-48h di propagazione DNS:
- **Sito accessibile**: `https://gallery.tuodominio.com`
- **Link condivisione**: `https://gallery.tuodominio.com/album/123`
- **SSL**: Automatico ✅
- **Performance**: Identica ✅

## 🔧 Nessuna Modifica Codice Necessaria!

Il codice che ho già modificato funzionerà automaticamente:
- `window.location.origin` sarà `https://gallery.tuodominio.com`
- I link di condivisione useranno automaticamente il nuovo dominio
- Zero configurazione aggiuntiva necessaria!

## 📋 Comandi Utili

```bash
# Verifica mapping domini
gcloud run domain-mappings list --region us-west1

# Verifica servizio
gcloud run services describe ai-photo-gallery --region us-west1

# Redeploy se necessario
gcloud run deploy ai-photo-gallery \
  --source . \
  --region us-west1 \
  --allow-unauthenticated
```

## 🐛 Troubleshooting

### DNS non risolve
- Aspetta 24-48h per propagazione
- Verifica record DNS su IONOS
- Testa con: `nslookup gallery.tuodominio.com`

### Errore SSL
- Google Cloud Run gestisce SSL automaticamente
- Può richiedere 15-30 minuti dopo mapping dominio

### Dominio non mappato
```bash
# Lista domini disponibili
gcloud domains list-user-verified

# Verifica ownership
gcloud domains verify gallery.tuodominio.com
```

## 💰 Costi

- **Mapping dominio**: GRATUITO ✅
- **SSL Certificate**: GRATUITO ✅  
- **Cloud Run**: Stesso costo di prima
- **Costo aggiuntivo**: €0.00

## 🎯 Vantaggi Cloud Run vs Firebase Hosting

✅ **Cloud Run**:
- Server-side rendering possibile
- Più controllo sul backend
- Docker containers
- Scaling automatico

❌ **Firebase Hosting**:
- Solo static files
- Meno flessibilità
- Ma più semplice per siti statici

**Il tuo setup Cloud Run è perfetto per questo progetto!** 🚀


