// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyDFfFdfV8ozLGa0xpfxAW5tzqluSTs1f0g",
    authDomain: "qr-menugen.firebaseapp.com",
    projectId: "qr-menugen",
    storageBucket: "qr-menugen.appspot.com",
    messagingSenderId: "377668216980",
    appId: "1:377668216980:web:c768b84a787a6b8a5aac81",
    measurementId: "G-1DVL1QFRPN"
  };
  

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
