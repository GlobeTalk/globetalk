import admin from "firebase-admin";

/**
 * Initializes Firebase Admin if not already initialized.
 * Exports the `admin` instance for use across the server.
 *
 * Environment variable required:
 *   FIREBASE_SERVICE_ACCOUNT  -> JSON string of the service account
 */
export function initFirebaseAdmin() {
  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("✅ Firebase Admin initialized");
  }
}

export { admin };
