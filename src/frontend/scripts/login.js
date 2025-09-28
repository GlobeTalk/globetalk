import { signInWithGoogle, observeUser } from "../../services/firebase.js";

// ✅ Firestore/Backend user check (replace API URL or Firestore logic)
async function checkIfUserExists(userId) {
  try {
    const response = await fetch(`/api/users/${userId}/exists`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("idToken")}`
      }
    });
    const data = await response.json();
    return data.exists; // expected response: { exists: true/false }
  } catch (err) {
    console.error("Error checking user existence:", err);
    return false;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const privacyCheckbox = document.getElementById("privacy");
  const consentCheckbox = document.getElementById("consent");

  // ✅ Enable/disable login button
  function updateButtonState() {
    const returningUser = localStorage.getItem("policiesAccepted") === "true";
    loginBtn.disabled = !(
      returningUser || (privacyCheckbox.checked && consentCheckbox.checked)
    );
  }
  updateButtonState();

  privacyCheckbox.addEventListener("change", updateButtonState);
  consentCheckbox.addEventListener("change", updateButtonState);

  // ✅ Google Login Flow
  loginBtn.addEventListener("click", async () => {
    try {
      const policiesAccepted = privacyCheckbox.checked && consentCheckbox.checked;
      if (!localStorage.getItem("policiesAccepted") && !policiesAccepted) {
        console.log("Please accept both privacy policy and consent terms.");
        return;
      }

      // Firebase sign-in
      const { user } = await signInWithGoogle();
      // Always get a fresh token after sign-in
      const idToken = await user.getIdToken(true);
  console.log("✅ User signed in: " + user.displayName);
  console.log("[Login] Got fresh ID token after sign-in: " + idToken);

      localStorage.setItem("idToken", idToken);
      localStorage.setItem("policiesAccepted", "true");

      const isExistingUser = await checkIfUserExists(user.uid);
      console.log("[Login] User exists? " + isExistingUser);
      if (isExistingUser) {
        console.log("[Login] Redirecting to /dashboard.html");
        window.location.href = "../../../pages/dashboard.html";
      } else {
        console.log("[Login] Redirecting to /onboarding.html");
        window.location.href = "../../../pages/onboarding.html";
      }

    } catch (err) {
      console.error("❌ Login failed:", err);
      console.log("Login failed. Please try again.");
    }
  });

  // ✅ Keyboard accessibility
  loginBtn.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && !loginBtn.disabled) {
      e.preventDefault();
      loginBtn.click();
    }
  });

  // ✅ Observe login state changes
  observeUser(async (user) => {
  console.log("[AuthState] onAuthStateChanged fired. User: " + (user ? user.email : "null"));
    if (user) {
      // Always get a fresh token before API calls
      const idToken = await user.getIdToken(true);
      console.log("[AuthState] Got fresh ID token: " + idToken);
      localStorage.setItem("idToken", idToken);

      console.log("👤 Logged in as: " + user.email);
      const exists = await checkIfUserExists(user.uid);
      console.log("[AuthState] User exists? " + exists);
      if (exists) {
        console.log("[AuthState] Redirecting to /dashboard.html");
        window.location.href = "../../../pages/dashboard.html";
      } else if (localStorage.getItem("policiesAccepted") === "true") {
        console.log("[AuthState] Redirecting to /onboarding.html");
        window.location.href = "../../../pages/onboarding.html";
      }
    } else {
      console.log("🚪 Not logged in. Redirecting to login.html");
      // Optionally redirect to login.html if not already there
      if (!window.location.pathname.endsWith("login.html")) {
        window.location.href = "../../../pages/login.html";
      }
    }
  });
});
