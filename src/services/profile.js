
import admin from './FirebaseAdmin.js';

const db = admin.firestore();

// Create or update user profile
export async function saveUserProfile(userId, profileData) {
  try {
    await setDoc(doc(db, "users", userId), profileData, { merge: true });
    console.log("Profile saved successfully!");
    return true;
  } catch (error) {
    console.error("Error saving profile: ", error);
    return false;
  }
}

// Get user profile
export async function getUserProfile(userId) {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log("No such profile!");
      return null;
    }
  } catch (error) {
    console.error("Error getting profile: ", error);
    return null;
  }
}

// Update specific profile fields
export async function updateUserProfile(userId, updates) {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, updates);
    console.log("Profile updated successfully!");
    return true;
  } catch (error) {
    console.error("Error updating profile: ", error);
    return false;
  }
}