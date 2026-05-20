import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyAoG9qgWroQkn16ZycKld_cz8PN-nGg4ps',
  authDomain: 'nexabank-20f33.firebaseapp.com',
  projectId: 'nexabank-20f33',
  storageBucket: 'nexabank-20f33.firebasestorage.app',
  messagingSenderId: '359679196146',
  appId: '1:359679196146:web:e8f986ee038bac7d54c96b'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function queueEmail(to, subject, text, html) {
  const payload = {
    to,
    message: {
      subject: subject || '',
      text: text || '',
      html: html || ''
    }
  };
  await addDoc(collection(db, 'mail'), payload);
}

async function saveLoginOtp(userId, email, hash, expiresAt) {
  await setDoc(doc(db, 'login_otps', userId), { userId, email, hash, expiresAt, createdAt: serverTimestamp() });
}

async function getLoginOtp(userId) {
  const snap = await getDoc(doc(db, 'login_otps', userId));
  if (!snap.exists()) return null;
  return snap.data();
}

async function deleteLoginOtp(userId) {
  await deleteDoc(doc(db, 'login_otps', userId));
}

window.NB_FIREBASE = { app, db, queueEmail, saveLoginOtp, getLoginOtp, deleteLoginOtp };

export { app, db, queueEmail, saveLoginOtp, getLoginOtp, deleteLoginOtp };
