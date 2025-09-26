import { admin } from "../../firebaseAdmin.js";

const db = admin.firestore();
const usersCollection = db.collection("users");

/**
 * Check if a user exists by UID
 * @param {string} uid
 * @returns {Promise<boolean>}
 */
export async function userExists(uid) {
  const doc = await usersCollection.doc(uid).get();
  return doc.exists;
}

/**
 * Create a new user in Firestore
 * @param {Object} userData - { uid, email, displayName }
 * @returns {Promise<Object>} - created user data
 */
export async function createUser(userData) {
  const { uid, email, displayName } = userData;
  const docRef = usersCollection.doc(uid);
  await docRef.set({
    email,
    displayName: displayName || null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  const newUserDoc = await docRef.get();
  return newUserDoc.data();
}
