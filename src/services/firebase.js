// src/services/firebase.js
import { 
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { initializeApp } from "firebase/app";

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
const googleProvider = new GoogleAuthProvider();


export function observeUser(callback) {

  return onAuthStateChanged(auth, callback);
}


export async function signInWithGoogle() {

  const result = await signInWithPopup(auth, googleProvider);

  const user = result.user;

 

  return { user };
}

export {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
};
