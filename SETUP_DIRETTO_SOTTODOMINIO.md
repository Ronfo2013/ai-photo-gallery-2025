# Setup Diretto Sottodominio (Senza .env)

## 🎯 Approccio Semplificato

**NON serve file .env** - il progetto usa automaticamente il dominio dove è hostato!

## 📋 Passi

### 1. IONOS - Crea Sottodominio
1. Pannello IONOS → Domini
2. Crea sottodominio: `gallery` 
3. Risultato: `gallery.tuodominio.com`

### 2. IONOS - Configura DNS
**Per Firebase Hosting:**
```
Tipo: CNAME
Nome: gallery
Valore: tuoprogetto.web.app
```

**Per Server Personalizzato:**
```
Tipo: A
Nome: gallery  
Valore: IP_DEL_SERVER
```

### 3. Deploy Progetto
```bash
# Build
npm run build

# Deploy su Firebase
firebase deploy --only hosting

# O carica dist/ sul server
```

### 4. Configura Dominio su Firebase (se usi Firebase)
1. Firebase Console → Hosting
2. "Aggiungi dominio personalizzato"
3. Inserisci: `gallery.tuodominio.com`
4. Segui le istruzioni DNS

## ✅ Risultato Automatico

Quando il sito è su `gallery.tuodominio.com`:
- Link condivisione: `gallery.tuodominio.com/album/123` ✅
- Meta tags social: `gallery.tuodominio.com/album/123` ✅
- Tutto funziona automaticamente! 🚀

## 🔧 Come Funziona il Codice

```javascript
// Nel codice attuale:
const shareUrl = `${window.location.origin}/album/${album.id}`;

// Se il sito è su gallery.tuodominio.com:
// window.location.origin = "https://gallery.tuodominio.com"
// shareUrl = "https://gallery.tuodominio.com/album/123"
```

## 💡 Quando Usare .env

Usa `.env` solo se:
- Vuoi testare in locale con dominio di produzione
- Hai più ambienti (dev/staging/prod)
- Vuoi override manuale del dominio

Altrimenti, il **deploy diretto è più semplice**! 🎯


