import { db } from './firebase-temp.js';
import { collection, getDocs, getDoc, query, where, doc, setDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Get total number of banned users
export async function getBannedUserCount() {
    try {
        const q = collection(db, "bannedUsers")
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
        const q = collection(db, "reports")
        const snapshot = await getDocs(q);
        return snapshot.size;
    } catch (error) {
        console.error("Error getting flagged user count:", error);
        return 0;
    }
}

export async function getFlaggedUsers() {
    try {
        const q = collection(db, "reports");
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
        const q = collection(db, "users");
        const snapshot = await getDocs(q);
        return snapshot.size;
    } catch (error) {
        console.error("Error getting active user count:", error);
        return 0;
    }
}

export async function banUser(userId) {
    try {
        const userRef = doc(db, "bannedUsers", userId);
        await setDoc(userRef, {
           // email: userEmail, will add later after setting up sending emails
            timestamp: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error("Error banning user:", error);
        return false;
    }
}

export async function unbanUser(userId) {
    try {
        const userRef = doc(db, "bannedUsers", userId);
        await deleteDoc(userRef);
        return true;
    } catch (error) {
        console.error("Error unbanning user:", error);
        return false;
    }
}


export async function isBannedUser(userId) {
    try {
        const userRef = doc(db, "bannedUsers", userId);
        const snapshot = await getDoc(userRef);
        return snapshot.exists();
    } catch (error) {
        console.error("Error checking if user is banned:", error);
        return null;
    }
}

export async function isAdmin(userId) {
    try {
        const userRef = doc(db, "admins", userId);
        const snapshot = await getDoc(userRef);
        return snapshot.exists();
    } catch (error) {
        console.error("Error checking if user is admin:", error);
        return null;
    }
}