import { signInWithGoogle, observeUser } from "../services/auth/authService.js";

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
        alert("Please accept both privacy policy and consent terms.");
        return;
      }

      // Firebase sign-in
      const { user, idToken } = await signInWithGoogle();
      console.log("✅ User signed in:", user.displayName);

      localStorage.setItem("idToken", idToken);
      localStorage.setItem("policiesAccepted", "true");

      const isExistingUser = await checkIfUserExists(user.uid);
      window.location.href = isExistingUser ? "/dashboard.html" : "/onboarding.html";

    } catch (err) {
      console.error("❌ Login failed:", err);
      alert("Login failed. Please try again.");
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
  observeUser((user) => {
    if (user) {
      console.log("👤 Logged in as:", user.email);
      checkIfUserExists(user.uid).then((exists) => {
        if (exists) {
          window.location.href = "/dashboard.html";
        } else if (localStorage.getItem("policiesAccepted") === "true") {
          window.location.href = "/onboarding.html";
        }
      });
    } else {
      console.log("🚪 Not logged in");
    }
  });
});
