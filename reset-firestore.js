// Script per pulire i dati vecchi da Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "1:YOUR_SENDER_ID:web:209c59e241883bf96f633c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function resetData() {
  try {
    console.log('🔥 Cancellazione dati vecchi da Firestore...');
    const docRef = doc(db, 'gallery', 'config');
    await deleteDoc(docRef);
    console.log('✅ Dati cancellati! Al prossimo caricamento verranno rigenerati puliti.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Errore:', error);
    process.exit(1);
  }
}

resetData();

