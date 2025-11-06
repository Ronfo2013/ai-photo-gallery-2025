import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectStorageEmulator, getStorage } from 'firebase/storage';

// Firebase configuration
// Queste credenziali verranno prese dalle variabili d'ambiente
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// 🚀 LOGICA DI CONNESSIONE AGLI EMULATORI
// Questa sezione si attiva solo in ambiente di sviluppo locale (`make dev`)
if (import.meta.env.VITE_FIREBASE_USE_EMULATOR === 'true') {
  console.log("🔌 Modalità sviluppo: Connessione agli emulatori Firebase...");

  try {
    // Emulatore Firestore
    const firestoreHost = import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_HOST || 'localhost:8080';
    const [firestoreIp, firestorePort] = firestoreHost.split(':');
    connectFirestoreEmulator(db, firestoreIp, parseInt(firestorePort, 10));
    console.log(`🔥 Emulatore Firestore connesso a: ${firestoreHost}`);

    // Emulatore Storage
    const storageHost = import.meta.env.VITE_FIREBASE_STORAGE_EMULATOR_HOST || 'localhost:9199';
    const [storageIp, storagePort] = storageHost.split(':');
    connectStorageEmulator(storage, storageIp, parseInt(storagePort, 10));
    console.log(`📦 Emulatore Storage connesso a: ${storageHost}`);

    // Emulatore Auth
    const authHost = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST || 'localhost:9099';
    connectAuthEmulator(auth, `http://${authHost}`, { disableWarnings: true });
    console.log(`👤 Emulatore Auth connesso a: ${authHost}`);

  } catch (error) {
    console.error("❌ Errore durante la connessione agli emulatori:", error);
  }

} else {
  console.log("🌍 Modalità produzione: Connessione ai servizi Firebase reali.");
}

// Esporta i servizi inizializzati
export { auth, db, storage };
export default app;

