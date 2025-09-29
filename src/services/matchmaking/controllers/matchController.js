import { admin } from "../firebaseAdmin.js";

const db = admin.firestore();

/**
 * Find a random match for a user based on prefs.
 * @param {string} userId - UID of the requester
 * @param {Object} prefs - { language, region, interest }
 * @returns {Promise<Object|null>} - matched user data or null if none
 */
export async function getRandomMatch(userId, prefs) {
  const { language, region, interest } = prefs;

  // get requester doc
  const userRef = db.collection("users").doc(userId);
  const userSnap = await userRef.get();
  if (!userSnap.exists) {
    throw new Error("User not found");
  }

  const requester = userSnap.data();
  const pastMatches = requester.matchedWith || [];

  // query candidates
  const usersRef = db.collection("users");
  const snapshot = await usersRef
    .where("language", "==", language)
    .where("region", "==", region)
    .where("interests", "array-contains", interest)
    .get();

  const candidates = [];
  snapshot.forEach(docSnap => {
    if (docSnap.id !== userId && !pastMatches.includes(docSnap.id)) {
      candidates.push({ id: docSnap.id, ...docSnap.data() });
    }
  });

  if (candidates.length === 0) return null;

  // pick random
  const randomIndex = Math.floor(Math.random() * candidates.length);
  const match = candidates[randomIndex];

  // update both users
  await userRef.update({ matchedWith: admin.firestore.FieldValue.arrayUnion(match.id) });
  await db.collection("users").doc(match.id).update({ matchedWith: admin.firestore.FieldValue.arrayUnion(userId) });

  return match;
}
