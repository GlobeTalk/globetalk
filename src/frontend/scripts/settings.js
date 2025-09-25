// settings.js


import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCtAw-A06ZJvKXfbfpNu9D8rYurdgX0sVk",
  authDomain: "globetalk-2508c.firebaseapp.com",
  projectId: "globetalk-2508c",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const userId = "User123";
const secretCode = "groupBKPTN9";

/**
 * Fetches user settings from Firestore
 * @returns {Promise<Object|null>} Settings data or null if none found
 */


/*export async function fetchSettings() {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error loading settings:", error);
    throw error;
  }
}

/**
 * Applies given settings data to the form inputs
 * @param {Object} data 
 * @param {HTMLElement} formElement 
 */


export function applySettingsToForm(data, formElement) {
  if (!data || !formElement) return;

  // Map your fields here
  formElement.querySelector("#language").value = data.language || "";
  formElement.querySelector("#region").value = data.region || "";
  formElement.querySelector("#timezone").value = data.timezone || "";
  formElement.querySelector("#ageRange").value = data.ageRange || "";
  formElement.querySelector("#hobbies").value = data.hobbies || "";
  formElement.querySelector("#bio").value = data.bio || "";
  formElement.querySelector("#matchWith").value = data.matchWith || "";
  formElement.querySelector("#profileVisibility").value = data.profileVisibility || "";
  formElement.querySelector("#matchPreferences").value = data.matchPreferences || "";
  formElement.querySelector("#notifications").value = data.notifications || "";
  formElement.querySelector("#funFact").value = data.funFact || "";
}

/**
 * Collects data from form inputs
 * @param {HTMLElement} formElement 
 * @returns {Object} Collected form data
 */

export function collectFormData(formElement) {
  if (!formElement) return {};

  return {
    language: formElement.querySelector("#language").value,
    region: formElement.querySelector("#region").value,
    timezone: formElement.querySelector("#timezone").value,
    ageRange: formElement.querySelector("#ageRange").value,
    hobbies: formElement.querySelector("#hobbies").value,
    bio: formElement.querySelector("#bio").value,
    matchWith: formElement.querySelector("#matchWith").value,
    profileVisibility: formElement.querySelector("#profileVisibility").value,
    matchPreferences: formElement.querySelector("#matchPreferences").value,
    notifications: formElement.querySelector("#notifications").value,
    funFact: formElement.querySelector("#funFact").value,
    secret: secretCode
  };
}

/**
 * Saves user settings to Firestore
 * @param {Object} data 
 * @returns {Promise<void>}
 */


export async function saveSettings(data) {
  try {
    await setDoc(doc(db, "users", userId), data);
  } catch (error) {
    console.error("Error saving document:", error);
    throw error;
  }
}



/**
 * Initialize form event listener to handle submit
 * @param {HTMLElement} formElement 
 */


export function setupFormListener(formElement) {
  if (!formElement) return;

  formElement.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const data = collectFormData(formElement);
      await saveSettings(data);
      alert(" Changes saved successfully!");
    } catch (error) {
      alert(" Failed to save changes.");
    }
  }); 
}
