# 🔗 Configurazione URL Personalizzato per Share Album

## 🎯 **PROBLEMA**

Gli URL di condivisione album usano sempre l'URL di Cloud Run invece del dominio personalizzato:
```
❌ ATTUALE: https://ai-photo-gallery-YOUR_SENDER_ID.us-west1.run.app/#/album/123
✅ DESIDERATO: https://gallery.opiumpordenone.com/#/album/123
```

---

## ✅ **SOLUZIONE: Configurare Site URL nell'Admin Panel**

### **STEP 1: Accedi all'Admin Panel**

1. Vai su: https://ai-photo-gallery-YOUR_SENDER_ID.us-west1.run.app/#/admin
2. Fai login con le credenziali Firebase

---

### **STEP 2: Configura il Site URL**

1. Nella sezione **"Site Settings"**
2. Trova il campo **"🔗 Site URL (per condivisione album)"**
3. Inserisci il tuo dominio personalizzato:
   ```
   https://gallery.opiumpordenone.com
   ```
4. **IMPORTANTE**: 
   - ✅ Includi `https://`
   - ✅ NO trailing slash alla fine
   - ✅ Usa il dominio pubblico (non l'URL di Cloud Run)

5. Clicca **"Save Settings"**

---

### **STEP 3: Testa la Condivisione**

1. Vai a un album
2. Clicca sul pulsante **"Share"** (icona condivisione)
3. Copia il link
4. Verifica che sia: `https://gallery.opiumpordenone.com/#/album/...`

---

## 🔍 **DEBUG: Verifica Configurazione**

### **Console Browser**

Apri DevTools (F12) → Console quando visualizzi un album.

Cerca il messaggio:
```
🔍 DEBUG Share URL: {
  albumId: "...",
  siteUrl: "https://gallery.opiumpordenone.com",  ← Deve essere il TUO dominio
  generatedShareUrl: "https://gallery.opiumpordenone.com/#/album/...",
  fullSiteSettings: {...}
}
```

### **Se `siteUrl` è vuoto:**
- ✅ Vai nell'Admin Panel
- ✅ Configura il campo "Site URL"
- ✅ Salva

### **Se `siteUrl` è configurato ma non funziona:**
- ✅ Ricarica la pagina (hard refresh: Cmd+Shift+R)
- ✅ Verifica che il salvataggio sia andato a buon fine

---

## 🔧 **COME FUNZIONA**

### **Logica URL (priorità)**

```javascript
// 1. PRIORITÀ MASSIMA: URL configurato nell'Admin Panel
if (siteSettings.siteUrl && siteSettings.siteUrl !== '') {
  return siteSettings.siteUrl;
}

// 2. Variabile d'ambiente VITE_APP_URL
if (import.meta.env.VITE_APP_URL) {
  return import.meta.env.VITE_APP_URL;
}

// 3. Fallback: URL di Cloud Run
return 'https://ai-photo-gallery-YOUR_SENDER_ID.us-west1.run.app';
```

### **File Coinvolti:**
- `utils/urlUtils.ts` - Logica generazione URL
- `pages/AlbumView.tsx` - Usa `getShareUrl()`
- `pages/AdminPanel.tsx` - Form configurazione
- `context/AppContext.tsx` - Caricamento settings
- `types.ts` - Interfaccia `SiteSettings`

---

## 🚀 **DEPLOY NECESSARIO?**

**NO!** La configurazione funziona **subito**:
- ✅ Configurazione salvata in Firestore
- ✅ Caricata al refresh della pagina
- ✅ Usata per tutti gli URL di share

---

## 📋 **CONFIGURAZIONE DOMINIO (Se Non Fatto)**

Se `gallery.opiumpordenone.com` **non punta ancora** all'app:

### **IONOS - Record DNS:**
```
Tipo: CNAME
Nome: gallery
Valore: ghs.googlehosted.com.
TTL: 3600
```

### **Google Cloud Run - Custom Domain:**
```bash
gcloud run services add-iam-policy-binding ai-photo-gallery \
  --member="allUsers" \
  --role="roles/run.invoker" \
  --region=us-west1

gcloud beta run domain-mappings create \
  --service ai-photo-gallery \
  --domain gallery.opiumpordenone.com \
  --region us-west1
```

---

## ✅ **CHECKLIST**

- [ ] Accesso Admin Panel
- [ ] Campo "Site URL" compilato con: `https://gallery.opiumpordenone.com`
- [ ] Clic su "Save Settings"
- [ ] Hard refresh della pagina (Cmd+Shift+R)
- [ ] Test share album → URL corretto
- [ ] Console mostra `siteUrl` configurato

---

## 🎉 **RISULTATO FINALE**

### **Prima:**
```
https://ai-photo-gallery-YOUR_SENDER_ID.us-west1.run.app/#/album/album-123
```

### **Dopo:**
```
https://gallery.opiumpordenone.com/#/album/album-123
```

---

## 📝 **NOTE IMPORTANTI**

1. **Il campo può essere lasciato vuoto** → Userà Cloud Run URL
2. **Cambiare il campo funziona subito** → Nessun deploy necessario
3. **Il dominio deve essere già configurato** → DNS + Cloud Run mapping
4. **L'URL è usato SOLO per share** → L'app può essere accessibile da entrambi gli URL

---

**Data creazione**: 17 Ottobre 2025  
**Versione app**: 00025-7z7  
**Status**: ✅ Codice implementato correttamente


