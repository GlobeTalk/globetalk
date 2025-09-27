//import firebaseAdmin from "firebase-admin";
import admin from "firebase-admin";


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
export { admin };

// This file sets up and exports the Firebase Admin SDK for server-side use.
// It reads the service account credentials from environment variables for security.
// Make sure to set the FIREBASE_SERVICE_ACCOUNT environment variable with your service account JSON.
// Example: export FIREBASE_SERVICE_ACCOUNT='{"type": "...", "project_id": "...", ...}'
// You can then import { admin } from this file to use Firebase Admin features like authentication and Firestore.
