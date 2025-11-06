# 🔧 Fix Errore Firestore Permissions

## ❌ Errore
```
Error getting config from Firestore: FirebaseError: Missing or insufficient permissions.
```

## ✅ Soluzione: Configurare le Regole Firestore

### **Metodo 1: Console Firebase (Più veloce)**

1. **Apri Firebase Console**:
   ```
   https://console.firebase.google.com/project/gen-lang-client-0873479092/firestore/rules
   ```

2. **Nella sezione "Rules"**, sostituisci il contenuto con:

   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Regole per la collection 'gallery'
       match /gallery/{document=**} {
         // Permetti lettura pubblica (chiunque può vedere la gallery)
         allow read: if true;
         
         // Permetti scrittura a tutti (temporaneo - TODO: aggiungere autenticazione)
         allow write: if true;
       }
     }
   }
   ```

3. **Click su "Publish"** (pulsante in alto a destra)

4. **IMPORTANTE: Configura anche le Storage Rules** per le immagini:
   
   a. Apri:
   ```
   https://console.firebase.google.com/project/gen-lang-client-0873479092/storage/rules
   ```
   
   b. Sostituisci con:
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read: if true;
         allow write: if true;
       }
     }
   }
   ```
   
   c. Click su "Publish"

5. **Aspetta 10-30 secondi** per la propagazione delle regole

6. **Ricarica l'app**: https://ai-photo-gallery-595991638389.us-west1.run.app

---

### **Metodo 2: Google Cloud Console**

Se preferisci usare Google Cloud Console:

1. **Apri**:
   ```
   https://console.cloud.google.com/firestore/databases/-default-/rules?project=gen-lang-client-0873479092
   ```

2. Segui gli stessi passi del Metodo 1

---

### **Metodo 3: Firebase CLI (se installato)**

Se hai Firebase CLI installato:

```bash
cd ~/gallery2025-project

# Inizializza Firebase (solo la prima volta)
firebase login
firebase use gen-lang-client-0873479092

# Deploya le regole
firebase deploy --only firestore:rules
```

---

## 🧪 Test dopo il Fix

1. Apri l'app: https://ai-photo-gallery-595991638389.us-west1.run.app
2. Apri Console (F12)
3. **NON** dovresti più vedere l'errore "Missing or insufficient permissions"
4. L'app dovrebbe caricare correttamente

---

## ⚠️ Nota sulla Sicurezza

Le regole attuali permettono a **chiunque** di leggere e scrivere.

**Questo è OK per testing/sviluppo**, ma per produzione dovresti:

1. Abilitare Firebase Authentication
2. Modificare le regole per richiedere autenticazione:
   ```javascript
   match /gallery/{document=**} {
     allow read: if true; // Pubblico può vedere
     allow write: if request.auth != null; // Solo utenti autenticati possono modificare
   }
   ```

---

## 📝 File Creato

Ho creato il file `firestore.rules` nel progetto con le regole corrette.
Quando hai Firebase CLI, puoi deployare con:

```bash
firebase deploy --only firestore:rules
```

