import { db } from './firebase-temp.js';
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Get total number of banned users
export async function getBannedUserCount() {
    try {
        const q = query(collection(db, "users"), where("banned", "==", true));
        const snapshot = await getDocs(q);
        return snapshot.size;
    } catch (error) {
        console.error("Error getting banned user count:", error);
        return 0;
    }
}

// Get total number of flagged users
export async function getFlaggedUserCount() {
    try {
        const q = query(collection(db, "users"), where("flagged", "==", true));
        const snapshot = await getDocs(q);
        return snapshot.size;
    } catch (error) {
        console.error("Error getting flagged user count:", error);
        return 0;
    }
}

export async function getFlaggedUsers() {
    try {
        const q = collection(db, "flaggedUsers");
        const snapshot = await getDocs(q);
        return snapshot;
    } catch (error) {
        console.error("Error getting flagged users:", error);
        return [];
    }
}

// Get total number of active users
export async function getActiveUserCount() {
    try {
        const q = query(collection(db, "users"), where("active", "==", true));
        const snapshot = await getDocs(q);
        return snapshot.size;
    } catch (error) {
        console.error("Error getting active user count:", error);
        return 0;
    }
}

export async function addBannedUser(userId) {
    try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, { banned: true });
        return true;
    } catch (error) {
        console.error("Error banning user:", error);
        return false;
    }
}