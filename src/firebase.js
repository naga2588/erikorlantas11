import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC1hzlTkTt1AK4DhkR13XpB_wmal4s2v38",
  authDomain: "eri-korlantas.firebaseapp.com",
  projectId: "eri-korlantas",
  storageBucket: "eri-korlantas.firebasestorage.app",
  messagingSenderId: "472012289728",
  appId: "1:472012289728:web:86b6e0c5354f1e6ef99f25",
  measurementId: "G-541ZXTQCXZ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
