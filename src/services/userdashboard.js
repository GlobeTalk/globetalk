import { db } from './firebase.js';
import { doc, getDoc, query, collection, where, orderBy, getDocs, documentId } from "firebase/firestore";


export async function getPenPalSuggestions(userid) {
  // Get current user's hobbies
  const userDoc = await getDoc(doc(db, "users", userid));
  if (!userDoc.exists()) return [];
  const currentHobbies = userDoc.data().hobbies || [];
  if (!Array.isArray(currentHobbies) || currentHobbies.length === 0) return [];

  // Get all users except current
  const q = query(
    collection(db, "users"),
    where(documentId(),"!=", userid)
  );
  const snap = await getDocs(q);
  // Filter users with at least one hobby in common, limit to 5
  return snap.docs
    .map(doc => ({
      _docId: doc.id,
      ...doc.data()
    }))
    .filter(user => {
      const hobbies = user.hobbies || [];
      if (!Array.isArray(hobbies) || hobbies.length === 0) return false;
      return hobbies.some(hobby => currentHobbies.includes(hobby));
    })
    .slice(0, 5);
}
