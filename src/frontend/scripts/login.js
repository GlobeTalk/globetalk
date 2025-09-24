// login.js
import { getAuth, signInWithPopup, GoogleAuthProvider } from "../../services/firebase.js";

export function initLogin() {
  const loginBtn = document.getElementById("loginBtn");
  const privacyCheckbox = document.getElementById("privacy");
  const consentCheckbox = document.getElementById("consent");
  const statusDiv = document.getElementById("statusMessage");

  const auth = getAuth();
  const provider = new GoogleAuthProvider();

  loginBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const boxes = [privacyCheckbox, consentCheckbox];
    const allChecked = boxes.every(box => box.checked);

    boxes.forEach(box => box.parentElement.style.outline = "none");

    if (!allChecked) {
      alert("Please accept the Privacy Policy and give your consent before continuing.");
      boxes.forEach(box => {
        if (!box.checked) box.parentElement.style.outline = "2px solid red";
      });
      return;
    }

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      statusDiv.textContent = `Logged in as ${user.email}`;
    } catch (err) {
      console.error("Login failed:", err);
      statusDiv.textContent = "Login failed. Please try again.";
    }
  });
}

// Run automatically in browser
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", initLogin);
}
