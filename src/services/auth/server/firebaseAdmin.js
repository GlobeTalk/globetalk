import 'dotenv/config'; // Loads .env automatically for local development
import admin from "firebase-admin";

// Use __dirname only if needed for local paths (optional)
import path from "path";
import { fileURLToPath } from "url";

// Define __dirname for ES modules (if you need local path references)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Log environment variable check
console.log("FIREBASE_SERVICE_ACCOUNT:", !!process.env.FIREBASE_SERVICE_ACCOUNT);

// Always initialize Firebase Admin
if (!admin.apps.length) {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT not set in environment");
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (err) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT is not valid JSON");
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("✅ Firebase Admin initialized");
}

export { admin };
