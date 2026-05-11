// استيراد المكتبات اللازمة
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
   apiKey: "AIzaSyDfMOJ5d_wGiRSoBHNHdYdTu4Myl4G9UKE",
  authDomain: "pedago-adb3b.firebaseapp.com",
  projectId: "pedago-adb3b",
  storageBucket: "pedago-adb3b.firebasestorage.app",
  messagingSenderId: "139275955660",
  appId: "1:139275955660:web:3f88b766a9ef361be90169"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);

// تصدير الخدمات لاستخدامها في باقي صفحات المنصة
export const db = getFirestore(app);
export const auth = getAuth(app);