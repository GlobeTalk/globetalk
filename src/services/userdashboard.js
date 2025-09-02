import { db } from './firebase-temp.js';
import { doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";



// Update specific profile fields
export async function getActiveConversations(userId) {
const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", userId),
    orderBy("lastUpdated", "desc")
  );
  const snap = await getDocs(q);

  return snap.docs.map(doc => {
    const data = doc.data();
    const otherUser = data.participants.find(p => p !== userId);
    return {
      id: doc.id,
      otherUser,
      lastMessage: data.lastMessage,
      lastUpdated: data.lastUpdated.toDate()
    };
  });
}