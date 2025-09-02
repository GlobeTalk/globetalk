import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCtAw-A06ZJvKXfbfpNu9D8rYurdgX0sVk",
  authDomain: "globetalk-2508c.firebaseapp.com",
  projectId: "globetalk-2508c",
  storageBucket: "globetalk-2508c.firebasestorage.app",
  messagingSenderId: "1046584624165",
  appId: "1:1046584624165:web:6ed616da6aafdb52ddebcc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
export { auth, db };