import admin from "firebase-admin";

if (!admin.apps.length) {
  // Load service account from env variable (JSON string)
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : undefined;
  if (!serviceAccount) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT env variable not set");
  }
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
