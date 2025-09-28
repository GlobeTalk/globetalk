import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Firebase configuration (should be loaded from environment variables in production)
const firebaseConfig = {
  apiKey: "AIzaSyCtAw-A06ZJvKXfbfpNu9D8rYurdgX0sVk",
  authDomain: "globetalk-2508c.firebaseapp.com",
  projectId: "globetalk-2508c",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Select options
const languageOptions = [
  { value: "", text: "-- Select Language --", disabled: true },
  { value: "english", text: "English" },
  { value: "spanish", text: "Spanish" },
  { value: "french", text: "French" },
  { value: "mandarin", text: "Mandarin" },
  { value: "hindi", text: "Hindi" },
];

const regionOptions = [
  { value: "", text: "Select your Region/Timezone", disabled: true },
  { value: "Africa (Central)", text: "Africa (Central)" },
  { value: "Africa (Eastern)", text: "Africa (Eastern)" },
  { value: "Africa (Southern)", text: "Africa (Southern)" },
  { value: "Africa (Western)", text: "Africa (Western)" },
  { value: "Asia (Central)", text: "Asia (Central)" },
  { value: "Asia (Eastern)", text: "Asia (Eastern)" },
  { value: "Asia (Southern)", text: "Asia (Southern)" },
  { value: "Asia (Southeastern)", text: "Asia (Southeastern)" },
  { value: "Asia (Western)", text: "Asia (Western)" },
  { value: "Australia & Pacific", text: "Australia & Pacific" },
  { value: "Europe (Central)", text: "Europe (Central)" },
  { value: "Europe (Eastern)", text: "Europe (Eastern)" },
  { value: "Europe (Western)", text: "Europe (Western)" },
  { value: "North America (Central)", text: "North America (Central)" },
  { value: "North America (Eastern)", text: "North America (Eastern)" },
  { value: "North America (Mountain)", text: "North America (Mountain)" },
  { value: "North America (Pacific)", text: "North America (Pacific)" },
  { value: "North America (Western)", text: "North America (Western)" },
  { value: "South America (Andean)", text: "South America (Andean)" },
  { value: "South America (Brazilian)", text: "South America (Brazilian)" },
  { value: "South America (Southern)", text: "South America (Southern)" },
  { value: "South America (Western)", text: "South America (Western)" },
];

const ageRangeOptions = [
  { value: "", text: "Select your age range", disabled: true },
  { value: "18-24", text: "18–24" },
  { value: "25-34", text: "25–34" },
  { value: "35-44", text: "35–44" },
  { value: "45+", text: "45+" },
];

const genderOptions = [
  { value: "", text: "Select your gender", disabled: true },
  { value: "male", text: "Male" },
  { value: "female", text: "Female" },
  { value: "non-binary", text: "Non-binary" },
];

const hobbyOptions = [
  { value: "", text: "Select your interests", disabled: true },
  { value: "reading", text: "Reading" },
  { value: "music", text: "Music" },
  { value: "cooking", text: "Cooking" },
  { value: "sports", text: "Sports" },
  { value: "art", text: "Art" },
  { value: "travel", text: "Travel" },
];

const timezoneToRegion = {
  "Africa/": "Africa",
  "Asia/": "Asia",
  "Australia/": "Australia & Pacific",
  "Europe/": "Europe",
  "America/New_York": "North America (Eastern)",
  "America/Chicago": "North America (Central)",
  "America/Denver": "North America (Mountain)",
  "America/Los_Angeles": "North America (Pacific)",
  "America/Argentina/": "South America (Southern)",
  "America/Sao_Paulo": "South America (Brazilian)",
  "America/Lima": "South America (Western)",
  "Pacific/": "Australia & Pacific"
};

// Utility function to populate select elements
function populateSelectElement(selectId, options) {
  const select = document.getElementById(selectId);
  if (!select) {
    console.error(`Select element with ID ${selectId} not found`);
    return;
  }
  options.forEach(({ value, text, disabled }) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = text;
    if (disabled) {
      option.disabled = true;
      option.selected = true;
    }
    select.appendChild(option);
  });
}

// Fetch and populate languages from LanguageTool API
async function populateLanguages() {
  const dropdown = document.getElementById("languages");
  if (!dropdown) {
    console.error("Languages dropdown not found");
    return;
  }

  try {
    const response = await fetch("https://api.languagetoolplus.com/v2/languages");
    if (!response.ok) throw new Error(`Network response was not ok: ${response.status}`);

    const languages = await response.json();
    const uniqueNames = new Set();

    languages.forEach(lang => {
      const cleanName = lang.name.split("(")[0].trim();
      uniqueNames.add(cleanName);
    });

    const sortedLanguages = Array.from(uniqueNames).sort();
    dropdown.innerHTML = '<option value="" disabled selected>-- Select Language --</option>';

    sortedLanguages.forEach(langName => {
      const option = document.createElement("option");
      option.textContent = langName;
      option.value = langName.toLowerCase();
      dropdown.appendChild(option);
    });
  } catch (error) {
    console.error("Error loading languages:", error);
    dropdown.innerHTML = '<option value="" disabled selected>Error loading languages</option>';
  }
}

// Detect user's timezone and suggest region
function detectUserRegion() {
  const detectedLocation = document.getElementById("detectedLocation");
  if (!detectedLocation) {
    console.error("Detected location element not found");
    return;
  }

  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    detectedLocation.textContent = `Detected timezone: ${timezone}`;

    for (const [tzPattern, region] of Object.entries(timezoneToRegion)) {
      if (timezone.includes(tzPattern)) {
        document.getElementById("region").value = region;
        detectedLocation.textContent += ` | Suggested region: ${region}`;
        break;
      }
    }
  } catch (error) {
    console.error("Region detection failed:", error);
    detectedLocation.textContent = "Could not detect your timezone";
  }
}

// Save profile to Firestore
async function saveUserProfile(userId, data) {
  try {
    await setDoc(doc(db, "profiles", userId), data);
    return true;
  } catch (error) {
    console.error("Error saving profile:", error);
    return false;
  }
}

// Initialize form
function initializeForm() {
  // Populate select elements
  populateSelectElement("region", regionOptions);
  populateSelectElement("ageRange", ageRangeOptions);
  populateSelectElement("gender", genderOptions);
  populateSelectElement("hobbies", hobbyOptions);
  populateLanguages();
  detectUserRegion();

  // Handle form submission
  const profileForm = document.getElementById("profileForm");
  if (!profileForm) {
    console.error("Profile form not found");
    return;
  }

  onAuthStateChanged(auth, (user) => {
    if (user) {
      const userId = user.uid;
      console.log("User ID:", userId);

      profileForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = {
          ageRange: document.getElementById("ageRange").value,
          region: document.getElementById("region").value,
          languages: document.getElementById("languages").value.split(",").map(lang => lang.trim()),
          hobbies: document.getElementById("hobbies").value.split(",").map(hobby => lang.trim()),
          threeWords: document.getElementById("threeWords").value,
          createdAt: new Date(),
          groupCode: "groupBKPTN9"
        };

        const success = await saveUserProfile(userId, formData);
        if (success) {
          alert("Profile created successfully 🎉");
          window.location.href = "index.html";
        } else {
          alert("Error saving profile. Please try again.");
        }
      });
    } else {
      alert("You need to be logged in to create a profile.");
      //window.location.href = "login.html";
    }
  });
}

// Initialize on DOM content loaded
document.addEventListener("DOMContentLoaded", initializeForm);