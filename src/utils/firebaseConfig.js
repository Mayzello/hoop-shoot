// src/utils/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAg_gCLf7rD92jCMlGZ4adYp_XMph5BUpA",
  authDomain: "hoopshoot-c6f1c.firebaseapp.com",
  projectId: "hoopshoot-c6f1c",
  databaseURL: "https://hoopshoot-c6f1c-default-rtdb.asia-southeast1.firebasedatabase.app", // ✅ tambahkan ini
  storageBucket: "hoopshoot-c6f1c.appspot.com", // ✅ perbaiki ini
  messagingSenderId: "752329323640",
  appId: "1:752329323640:web:72ad1f8e87d130016fe98d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

export { auth, db };
export const dbFirestore = getFirestore(app);
