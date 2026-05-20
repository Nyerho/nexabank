import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';

const firebaseConfig = {
  apiKey: 'AIzaSyAoG9qgWroQkn16ZycKld_cz8PN-nGg4ps',
  authDomain: 'nexabank-20f33.firebaseapp.com',
  projectId: 'nexabank-20f33',
  storageBucket: 'nexabank-20f33.firebasestorage.app',
  messagingSenderId: '359679196146',
  appId: '1:359679196146:web:e8f986ee038bac7d54c96b'
};

const app = initializeApp(firebaseConfig);

window.NB_FIREBASE = { app };

export { app };
