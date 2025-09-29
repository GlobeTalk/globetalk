//import firebaseAdmin from "firebase-admin";
import admin from "firebase-admin";

// Initialize Firebase Admin SDK
let initialized = false;
export function initFirebaseAdmin() {
  if (!initialized && admin.apps.length === 0) {
    // Load service account from env
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : undefined;
    if (!serviceAccount) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT env variable not set");
    }
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    initialized = true;
  }
  return admin;
}

// export the initialized admin instance
export { admin };

// This file sets up and exports the Firebase Admin SDK for server-side use.
// It reads the service account credentials from environment variables for security.
// Make sure to set the FIREBASE_SERVICE_ACCOUNT environment variable with your service account JSON.
// Example: export FIREBASE_SERVICE_ACCOUNT='{"type": "...", "project_id": "...", ...}'
// You can then import { admin } from this file to use Firebase Admin features like authentication and Firestore.

// from the root, path to this file is src/services/FirebaseAdmin.js
//import firebaseAdmin from "firebase-admin";
import admin from "firebase-admin";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
//dotenv.config({ path: path.resolve('../../.env') }); // adjust relative path

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, "../../.env");
console.log("Attempting to load .env from:", envPath);
dotenv.config({ path: envPath });

// Initialize Firebase Admin SDK
export function initFirebaseAdmin() {
  if (!admin.apps.length) {
    // Ensure the service account JSON is available in environment variables
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable is not set");
    }
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin initialized");
  }
}

// export the initialized admin instance
export default admin;

// This file sets up and exports the Firebase Admin SDK for server-side use.
// It reads the service account credentials from environment variables for security.
// Make sure to set the FIREBASE_SERVICE_ACCOUNT environment variable with your service account JSON.
// Example: export FIREBASE_SERVICE_ACCOUNT='{"type": "...", "project_id": "...", ...}'
// You can then import { admin } from this file to use Firebase Admin features like authentication and Firestore.
