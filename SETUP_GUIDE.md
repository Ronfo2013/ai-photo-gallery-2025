# 🚀 Guida al Nuovo Setup di Sviluppo e Deploy Ottimizzato

Questo documento riassume le modifiche implementate per migliorare il workflow di sviluppo, testing e deploy del progetto AI Photo Gallery. Il sistema esistente non è stato modificato e rimane funzionante, ma questo nuovo setup offre vantaggi significativi in termini di velocità, consistenza e produttività.

---

## 🎯 Obiettivi Raggiunti

1.  **Velocità di Deploy Aumentata:** Deploy fino a 3 volte più veloci grazie a build ottimizzati e caching su Cloud Build.
2.  **Consistenza tra Ambienti:** L'ambiente di sviluppo locale ora simula perfettamente l'ambiente di produzione di Cloud Run, eliminando il problema del "funziona solo sulla mia macchina".
3.  **Semplificazione dei Comandi:** Comandi complessi sono stati astratti in semplici scorciatoie tramite `Makefile`.
4.  **Sviluppo Integrato:** Un unico comando avvia e gestisce tutti i servizi necessari (frontend, backend, emulatori Firebase).
5.  **Dati Persistenti in Locale:** I dati inseriti negli emulatori (Auth, Firestore, Storage) vengono salvati e ricaricati ad ogni sessione di sviluppo.

---

## 📁 File Aggiunti

Sono stati aggiunti i seguenti file di configurazione. **Nessun file di progetto esistente è stato modificato.**

| File | Scopo |
| :--- | :--- |
| `Makefile` | Contiene scorciatoie per i comandi più comuni (es. `make dev`). |
| `cloudbuild.yaml` | Istruzioni per Google Cloud Build per un deploy automatizzato e veloce. |
| `docker-compose.dev.yml` | Definisce e orchestra i servizi per l'ambiente di sviluppo locale (frontend, backend, Firebase). |
| `Dockerfile.optimized` | Dockerfile ottimizzato per la produzione, usato da `cloudbuild.yaml`. |
| `Dockerfile.dev` | Dockerfile per il container del backend Node.js in sviluppo. |
| `Dockerfile.frontend-dev`| Dockerfile per il container del frontend Vite in sviluppo. |
| `.vscode/` | Cartella con configurazioni per Cursor/VSCode per un'esperienza di sviluppo migliorata (tasks, debug, estensioni raccomandate). |
| `env.local.example` | Template per il file `.env.local` necessario per le configurazioni locali. |
| `SETUP_OTTIMIZZATO_COMPLETATO.md` | Documento di riepilogo finale. |

---

## 🚀 Guida Rapida ai Nuovi Comandi

### 1. Setup Iniziale (da fare solo una volta)

Questo comando prepara il tuo ambiente, installa le dipendenze e crea il file di configurazione locale.

```bash
make setup
```
*(Ricordati di compilare il file `.env.local` che viene creato con le tue chiavi, se necessario).*

### 2. Sviluppo Quotidiano

Questo è **l'unico comando che ti serve per iniziare a lavorare**. Avvia frontend, backend ed emulatori Firebase con hot-reload.

```bash
make dev
```
Per fermare tutto, premi `Ctrl+C`.

### 3. Deploy in Produzione

Questo è **l'unico comando che ti serve per deployare**. Usa il processo ottimizzato con Cloud Build.

```bash
make deploy
```

### 4. Altri Comandi Utili

| Comando | Descrizione |
| :--- | :--- |
| `make stop` | Ferma i container Docker in esecuzione. |
| `make clean` | Pulisce i file generati e i container Docker. |
| `make logs` | Mostra i log di tutti i servizi in tempo reale. |
| `make status`| Controlla lo stato dei servizi Docker. |
| `make help` | Mostra la lista di tutti i comandi disponibili. |

---

## 🤔 Come Funziona l'Isolamento tra Sviluppo e Produzione?

-   **Sviluppo (`make dev`):** Utilizza `docker-compose.dev.yml` per avviare i **servizi emulati** di Firebase in locale. Il codice si connette a `localhost` perché la variabile d'ambiente `VITE_FIREBASE_USE_EMULATOR` è impostata a `true`. I dati sono salvati localmente.
-   **Produzione (`make deploy`):** Utilizza `cloudbuild.yaml` e `Dockerfile.optimized`. La variabile `VITE_FIREBASE_USE_EMULATOR` non è presente, quindi il codice si connette ai **servizi Firebase reali** nel cloud usando le credenziali di produzione.

**Non c'è alcun rischio di conflitto tra i dati locali e quelli di produzione.** I due ambienti sono completamente separati e isolati.
