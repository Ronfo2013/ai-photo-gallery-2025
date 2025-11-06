// Script per pulire i dati vecchi da Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBzexnXOj4uAix3d2lZ8wZ57TRC5OaJKfs",
  authDomain: "gen-lang-client-0873479092.firebaseapp.com",
  projectId: "gen-lang-client-0873479092",
  storageBucket: "gen-lang-client-0873479092.firebasestorage.app",
  messagingSenderId: "595991638389",
  appId: "1:595991638389:web:209c59e241883bf96f633c"
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

