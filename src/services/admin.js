
import { db } from './firebase.js';
import { writeBatch, collection, getDocs, getDoc, query, where, doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";

// Get total number of banned users
export async function getBannedUserCount() {
    try {
        const snapshot = await getDocs(collection(db, "bannedUsers"));
        return snapshot.size;
    } catch (error) {
        console.error("Error getting banned user count:", error);
        throw new Error("Failed to get banned user count.");
    }
}

// Get total number of reported users
export async function getReportedUserCount() {
    try {
        const snapshot = await getDocs(collection(db, "reports"));
        return snapshot.size;
    } catch (error) {
        console.error("Error getting reported user count:", error);
        throw new Error("Failed to get reported user count.");
    }
}

export async function getUnresolvedReports() {
    try {
        const snapshot = await getDocs(collection(db, "reports"));
        const filtered = [];
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            if (!data.status || data.status !== 'resolved') {
                filtered.push(docSnap);
            }
        });
        filtered.empty = filtered.length === 0;
        filtered.size = filtered.length;
        filtered.forEach = (cb) => Array.prototype.forEach.call(filtered, cb);
        return filtered;
    } catch (error) {
        console.error("Error getting unresolved reports:", error);
        throw new Error("Failed to get unresolved reports.");
    }
}

export async function getResolvedReports() {
    try {
        const snapshot = await getDocs(collection(db, "reports"));
        const resolved = [];
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            if (data.status === 'resolved' || data.status === 'dismissed') {
                resolved.push(docSnap);
            }
        });
        resolved.empty = resolved.length === 0;
        resolved.size = resolved.length;
        resolved.forEach = (cb) => Array.prototype.forEach.call(resolved, cb);
        return resolved;
    } catch (error) {
        console.error("Error getting resolved reports:", error);
        throw new Error("Failed to get resolved reports.");
    }
}

export async function getAllReports() {
    try {
        return await getDocs(collection(db, "reports"));
    } catch (error) {
        console.error("Error getting all reports:", error);
        throw new Error("Failed to get all reports.");
    }
}

// Get total number of active users
export async function getActiveUserCount() {
    try {
        const snapshot = await getDocs(collection(db, "users"));
        return snapshot.size;
    } catch (error) {
        console.error("Error getting active user count:", error);
        throw new Error("Failed to get active user count.");
    }
}

// ban a user
export async function banUser(reportedUid, reporterUid, reportID,report, reason, reportedDate, adminId) {
    // Validate arguments to prevent Firestore path errors
    if (!reportedUid || typeof reportedUid !== 'string' || !reportedUid.trim()) {
        return { success: false, error: 'Invalid reported user ID.' };
    }
    if (!reportID || typeof reportID !== 'string' || !reportID.trim()) {
        return { success: false, error: 'Invalid report ID.' };
    }
    try {
        // Check if user is already banned
        const banUserRef = doc(db, "bannedUsers", reportedUid);
        const banUserSnap = await getDoc(banUserRef);
        if (banUserSnap.exists()) {
            return { success: false, error: 'User is already banned.' };
        }

        const banBatch = writeBatch(db);
        const banReportRef = doc(db, "reports", reportID);
        const banHistoryRef = doc(db, "banHistory", `${reportedUid}_${Date.now()}`); // unique ID per ban

        // Add ban info to bannedUsers
        banBatch.set(banUserRef, {
            banDate: serverTimestamp(),
            reportedBy: reporterUid,
            report: report,
            banReason: reason,
            reportID: reportID,
            reportedDate: reportedDate
        });

        // Mark report as resolved
        banBatch.set(banReportRef, {
             status: "resolved", 
             outcome: "banned", 
             outcomeReason: reason, 
             resolvedBy: adminId,
             resolvedAt: serverTimestamp()
            }, { merge: true });

        // Add ban to history
        banBatch.set(banHistoryRef, {
            bannedUid: reportedUid,
            banDate: serverTimestamp(),
            reportedBy: reporterUid,
            banReason: reason,
            reportID: reportID,
            reportedDate: reportedDate
        });

        await banBatch.commit();
        return { success: true };
    } catch (error) {
        console.error("Error banning user:", error);
        return { success: false, error: error.message || "Failed to ban user." };
    }
}

// unban a user
export async function unbanUser(userId, unbannedBy = null) {
    try {
        // Check if user is actually banned
        const unbanUserRef = doc(db, "bannedUsers", userId);
        const unbanUserSnap = await getDoc(unbanUserRef);
        if (!unbanUserSnap.exists()) {
            return { success: false, error: 'User is not currently banned.' };
        }

        const unbanBatch = writeBatch(db);

        // log unban in history
        const unbanHistoryRef = doc(db, "banHistory", `${userId}_unban_${Date.now()}`);
        const unbanHistoryData = {
            unbannedUid: userId,
            unbanDate: serverTimestamp(),
        };
        if (unbannedBy) unbanHistoryData.unbannedBy = unbannedBy;
        unbanBatch.set(unbanHistoryRef, unbanHistoryData);

        // Remove from currently banned users
        unbanBatch.delete(unbanUserRef);

        await unbanBatch.commit();
        return { success: true };
    } catch (error) {
        console.error("Error unbanning user:", error);
        return { success: false, error: error.message || "Failed to unban user." };
    }
}


export function dissmissReport(reportId, reason, adminId) {
    return new Promise(async (resolve, reject) => {
        if (!reportId || typeof reportId !== 'string' || !reportId.trim()) {
            return reject('Invalid report ID.');
        }
        try {
            const reportRef = doc(db, "reports", reportId);
            const reportSnap = await getDoc(reportRef);
            if (!reportSnap.exists()) {
                return reject('Report does not exist.');
            }
            await setDoc(reportRef, { 
                status: "resolved", 
                outcome: "dismissed", 
                outcomeReason: reason, 
                resolvedBy: adminId,
                resolvedAt: serverTimestamp()
             }, { merge: true });
            resolve({ success: true });
        } catch (error) {
            console.error("Error dismissing report:", error);
            reject(error.message || "Failed to dismiss report.");
        }
    });
}

// Get all banned users
export async function getBannedUsers() {
    try {
        return await getDocs(collection(db, "bannedUsers"));
    } catch (error) {
        console.error("Error getting banned users:", error);
        throw new Error("Failed to get banned users.");
    }
}

// Check if user is banned
export async function isBannedUser(userId) {
    try {
        const userRef = doc(db, "bannedUsers", userId);
        const snapshot = await getDoc(userRef);
        return snapshot.exists();
    } catch (error) {
        console.error("Error checking if user is banned:", error);
        throw new Error("Failed to check if user is banned.");
    }
}

// Check if user is admin
export async function isAdmin(userId) {
    try {
        const userRef = doc(db, "admins", userId);
        const snapshot = await getDoc(userRef);
        return snapshot.exists();
    } catch (error) {
        console.error("Error checking if user is admin:", error);
        throw new Error("Failed to check if user is admin.");
    }
}

// Get admin info
export async function getAdminInfo(userId) {
    try {
        const userRef = doc(db, "admins", userId);
        const snapshot = await getDoc(userRef);
        return snapshot.exists() ? snapshot.data() : null;
    } catch (error) {
        console.error("Error getting admin info:", error);
        throw new Error("Failed to get admin info.");
    }
}