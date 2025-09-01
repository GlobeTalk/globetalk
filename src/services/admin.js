import { db } from './firebase.js';
import { collection, getDocs, query, where } from "firebase/firestore";

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