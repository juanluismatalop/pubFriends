import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // 1. Añadimos el import de Firestore

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAhsFe8zd8nBQitEmLl57m8lSamUbgxwRQ",
  authDomain: "pubfriends-ff656.firebaseapp.com",
  projectId: "pubfriends-ff656",
  storageBucket: "pubfriends-ff656.firebasestorage.app",
  messagingSenderId: "567128556818",
  appId: "1:567128556818:web:d43974130f844937cf9fcb",
  measurementId: "G-RK3KFJSE28"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// 2. Inicializamos Firestore y exportamos 'db' para que el Login lo pueda usar
export const db = getFirestore(app);