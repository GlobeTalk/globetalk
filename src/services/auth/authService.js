// src/services/auth/authService.js
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

import { auth } from "./firebase.js";
import { googleProvider, githubProvider, facebookProvider } from "./providerConfig.js";

/**
 * Sign in with Google
 */
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  const idToken = await user.getIdToken();
  return { user, idToken };
}

/**
 * Sign in with GitHub
 */
export async function signInWithGitHub() {
  const result = await signInWithPopup(auth, githubProvider);
  const user = result.user;
  const idToken = await user.getIdToken();
  return { user, idToken };
}

/**
 * Sign in with Facebook (if enabled)
 */
export async function signInWithFacebook() {
  const result = await signInWithPopup(auth, facebookProvider);
  const user = result.user;
  const idToken = await user.getIdToken();
  return { user, idToken };
}

/**
 * Sign out the current user
 */
export async function logOut() {
  await signOut(auth);
}

/**
 * Observe user state changes
 * @param {function} callback Receives user or null
 */
export function observeUser(callback) {
  onAuthStateChanged(auth, callback);
}
