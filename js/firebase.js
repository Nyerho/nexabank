import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  setDoc,
  where
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
const auth = getAuth(app);

async function signIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

async function signUp(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

async function sendVerifyEmail(user) {
  return sendEmailVerification(user);
}

async function sendPasswordReset(email) {
  return sendPasswordResetEmail(auth, email);
}

async function signOutUser() {
  return signOut(auth);
}

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

async function upsert(collectionName, id, data) {
  await setDoc(doc(db, collectionName, id), data, { merge: true });
}

async function remove(collectionName, id) {
  await deleteDoc(doc(db, collectionName, id));
}

async function list(collectionName) {
  const snap = await getDocs(collection(db, collectionName));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function listWhere(collectionName, field, op, value) {
  const snap = await getDocs(query(collection(db, collectionName), where(field, op, value)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function getById(collectionName, id) {
  const snap = await getDoc(doc(db, collectionName, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

async function existsDoc(collectionName, id) {
  const snap = await getDoc(doc(db, collectionName, id));
  return snap.exists();
}

async function findOneByField(collectionName, field, value) {
  const snap = await getDocs(query(collection(db, collectionName), where(field, '==', value)));
  const docSnap = snap.docs[0];
  if (!docSnap) return null;
  return { id: docSnap.id, ...docSnap.data() };
}

window.NB_FIREBASE = {
  app,
  auth,
  db,
  signIn,
  signUp,
  sendVerifyEmail,
  sendPasswordReset,
  signOutUser,
  queueEmail,
  saveLoginOtp,
  getLoginOtp,
  deleteLoginOtp,
  upsert,
  remove,
  list,
  listWhere,
  getById,
  existsDoc,
  findOneByField
};

export { app, auth, db, signIn, signUp, sendVerifyEmail, sendPasswordReset, signOutUser, queueEmail, saveLoginOtp, getLoginOtp, deleteLoginOtp, upsert, remove, list, listWhere, getById, existsDoc, findOneByField };
