// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentSingleTabManager } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';

export const firebaseConfig = {
    apiKey: "AIzaSyDFfFdfV8ozLGa0xpfxAW5tzqluSTs1f0g",
    authDomain: "qr-menugen.firebaseapp.com",
    projectId: "qr-menugen",
    storageBucket: "qr-menugen.appspot.com",
    messagingSenderId: "377668216980",
    appId: "1:377668216980:web:c768b84a787a6b8a5aac81",
    measurementId: "G-1DVL1QFRPN"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Firestore with offline persistence enabled
export const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
        tabManager: persistentSingleTabManager(),
    }),
});

// Export other Firebase services
export const auth = getAuth(app);
export const storage = getStorage(app);
const functions = getFunctions(app); // Initialize Firebase Functions
