import { admin } from "../firebaseAdmin.js";

const db = admin.firestore();

/**
 * Find a random match for a user based on preferences.
 * @param {string} userId - UID of the requester
 * @param {Object} prefs - { language, region, interest }
 * @returns {Promise<Object|null>} - matched user data or null if none
 */
export async function getRandomMatch(userId, prefs) {
  if (!userId || typeof userId !== "string") {
    throw new Error("Invalid userId: must be a non-empty string");
  }
  if (!prefs || typeof prefs !== "object") {
    throw new Error("Invalid preferences: must be an object");
  }

  const { language, region, interest } = prefs;

  if (!language || !region || !interest) {
    throw new Error("Language, region, and interest are required");
  }

  // normalize inputs for comparison
  const langNorm = language.toLowerCase();
  const regionNorm = region.toLowerCase();
  const interestNorm = interest.toLowerCase();

  const userRef = db.collection("users").doc(userId);
  const userSnap = await userRef.get();

  if (!userSnap.exists) throw new Error(`User not found: ${userId}`);
  const requester = userSnap.data();

  const pastMatches = Array.isArray(requester?.matchedWith) ? requester.matchedWith : [];

  const usersRef = db.collection("users");

  // Firestore query
  let snapshot;
  try {
    snapshot = await usersRef
      .where("languages", "array-contains", language) // still exact match in Firestore
      .where("region", "==", region)
      .get();
  } catch (queryError) {
    throw new Error(`Database query failed: ${queryError.message}`);
  }

  // In-memory filtering with robust checks
  const candidates = snapshot.docs
    .map(docSnap => {
      const data = docSnap.data();
      if (!data || docSnap.id === userId) return null;

      // ensure arrays
      const candidateLanguages = Array.isArray(data.languages) ? data.languages : [];
      const candidateHobbies = Array.isArray(data.hobbies) ? data.hobbies : [];
      const candidateMatches = Array.isArray(data.matchedWith) ? data.matchedWith : [];

      // normalize for comparison
      const candidateLanguagesNorm = candidateLanguages.map(l => l.toLowerCase());
      const candidateHobbiesNorm = candidateHobbies.map(h => h.toLowerCase());

      // matching logic
      const alreadyMatched = pastMatches.includes(docSnap.id) || candidateMatches.includes(userId);
      const languageMatch = candidateLanguagesNorm.includes(langNorm);
      const regionMatch = (data.region || "").toLowerCase() === regionNorm;
      const interestMatch = candidateHobbiesNorm.includes(interestNorm);

      if (alreadyMatched || !languageMatch || !regionMatch || !interestMatch) return null;

      return { id: docSnap.id, ...data };
    })
    .filter(Boolean);

  if (candidates.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * candidates.length);
  const match = candidates[randomIndex];

  // Transaction to update both users
  try {
    await db.runTransaction(async (transaction) => {
      const requesterDocSnap = await transaction.get(userRef);
      const matchRef = db.collection("users").doc(match.id);
      const matchDocSnap = await transaction.get(matchRef);

      if (!requesterDocSnap.exists || !matchDocSnap.exists) {
        throw new Error("One of the users no longer exists");
      }

      const currentRequesterMatches = Array.isArray(requesterDocSnap.data()?.matchedWith)
        ? requesterDocSnap.data().matchedWith
        : [];
      const currentMatchMatches = Array.isArray(matchDocSnap.data()?.matchedWith)
        ? matchDocSnap.data().matchedWith
        : [];

      if (currentRequesterMatches.includes(match.id) || currentMatchMatches.includes(userId)) {
        throw new Error("Users already matched (race condition detected)");
      }
      console.log("Updating user:", userId, "with match:", match.id);
      transaction.update(userRef, {
        matchedWith: admin.firestore.FieldValue.arrayUnion(match.id)
        
      });
      console.log("Updating match:", match.id, "with user:", userId);
      transaction.update(matchRef, {
        
        matchedWith: admin.firestore.FieldValue.arrayUnion(userId)
        
      });
    });
  } catch (transactionError) {
    console.error("Transaction failed:", transactionError);
    return null; // fail silently instead of throwing
  }

  // return safe match data
  return {
    id: match.id,
    languages: match.languages || [],
    region: match.region || "",
    hobbies: match.hobbies || [],
  };
}
