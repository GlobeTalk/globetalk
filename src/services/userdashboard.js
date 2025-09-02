import { db } from './firebase-temp.js';
import { doc, getDoc, query, collection, where, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";



// Update specific profile fields
export async function getActiveConversations(username) {
  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", username),
    orderBy("lastUpdated", "desc")
  );
  const snap = await getDocs(q);

  return snap.docs.map(doc => {
    const data = doc.data();
    const otherUser = data.participants.find(p => p !== username);
    return {
      otherUser,
      lastUpdated: data.lastUpdated.toDate()
    };
  });
}

export async function getUsername(userId) {
  const userDoc = await getDoc(doc(db, "users", userId));
  return userDoc.exists() ? userDoc.data().username : null;
}
