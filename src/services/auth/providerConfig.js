// src/services/auth/providerConfig.js
import {
  GoogleAuthProvider,
  GithubAuthProvider,
  FacebookAuthProvider
} from "firebase/auth";

// Configure providers
export const googleProvider  = new GoogleAuthProvider();
export const githubProvider  = new GithubAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

// Optional: add custom scopes if needed
// googleProvider.addScope("profile");
// githubProvider.addScope("repo");
