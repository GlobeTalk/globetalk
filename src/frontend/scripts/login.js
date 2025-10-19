// --- Google Sign-In Helper ---
/*import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return { user: result.user };
}*/
import { auth, observeUser, signInWithGoogle } from "../../services/firebase.js";

import { isBannedUser, isAdmin } from "../../services/admin.js"; 

// ------------------ CONFIGURATION ------------------
const CONFIG = {
  API_BASE_URL: 'https://binarybandits-auth.onrender.com',
  PAGES: {
    LOGIN: '../../../pages/login.html',          // updated for dist/ folder
    DASHBOARD: '../../../pages/userdashboard.html',
    ONBOARDING: '../../../pages/onboarding.html',
    ADMIN_DASHBOARD: '../../../pages/admin.html' 
  },
  STORAGE_KEYS: {
    ID_TOKEN: 'idToken',
    POLICIES_ACCEPTED: 'policiesAccepted',
    USER_PREFERENCES: 'userPreferences'
  },
  RETRY_CONFIG: {
    MAX_ATTEMPTS: 3,
    DELAY_MS: 1000,
    BACKOFF_MULTIPLIER: 2
  }
};

// ------------------ ERROR CLASSES ------------------
class AuthError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.details = details;
  }
}

class NetworkError extends Error {
  constructor(message, status, details = {}) {
    super(message);
    this.name = 'NetworkError';
    this.status = status;
    this.details = details;
  }
}

// ------------------ UTILITY FUNCTIONS ------------------
const utils = {
  setSecureToken(token, expirationHours = 1) {
    const expiration = Date.now() + (expirationHours * 60 * 60 * 1000);
    const tokenData = { token, expiration };
    localStorage.setItem(CONFIG.STORAGE_KEYS.ID_TOKEN, JSON.stringify(tokenData));
  },

  getSecureToken() {
    try {
      const tokenData = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.ID_TOKEN));
      if (!tokenData || Date.now() > tokenData.expiration) {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.ID_TOKEN);
        return null;
      }
      return tokenData.token;
    } catch {
      localStorage.removeItem(CONFIG.STORAGE_KEYS.ID_TOKEN);
      return null;
    }
  },

  sanitizeUserId(userId) {
    if (!userId || typeof userId !== 'string') {
      throw new AuthError('Invalid user ID', 'INVALID_USER_ID');
    }
    return userId.trim();
  },

  async safeNavigate(url, loadingElement = null) {
    try {
      if (loadingElement) {
        loadingElement.style.display = 'block';
      }
      await new Promise(resolve => setTimeout(resolve, 500));

      if (!url || !url.startsWith('./') && !url.startsWith('../')) {
        throw new Error('Invalid navigation URL');
      }

      window.location.href = url;
    } catch (error) {
      console.error('Navigation error:', error);
      if (loadingElement) {
        loadingElement.style.display = 'none';
      }
      throw new AuthError('Navigation failed', 'NAVIGATION_ERROR', { url });
    }
  },

  retryOperation: async function retryOperation(operation, maxAttempts = CONFIG.RETRY_CONFIG.MAX_ATTEMPTS) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        console.warn(`Attempt ${attempt}/${maxAttempts} failed:`, error.message);
        
        if (attempt < maxAttempts) {
          const delay = CONFIG.RETRY_CONFIG.DELAY_MS * Math.pow(CONFIG.RETRY_CONFIG.BACKOFF_MULTIPLIER, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  },

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

// ------------------ CHECK IF USER EXISTS ------------------
async function checkIfUserExists(userId) {
  try {
    const sanitizedUserId = utils.sanitizeUserId(userId);
    
    return await utils.retryOperation(async () => {
      const token = utils.getSecureToken();
      console.log("🟡 Token being sent:", token ? token.substring(0, 20) + "..." : "null");
      if (!token) {
        throw new AuthError('No valid authentication token', 'NO_TOKEN');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/users/${sanitizedUserId}/exists`, {
          method: 'GET',
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new NetworkError(`Server error: ${response.status}`, response.status, errorData);
        }

        const data = await response.json();
        if (typeof data.exists !== 'boolean') {
          throw new AuthError('Invalid server response format', 'INVALID_RESPONSE');
        }

        return data.exists;
      } finally {
        clearTimeout(timeoutId);
      }
    });

  } catch (error) {
    console.error("Error checking user existence:", error);
    
    if (error instanceof AuthError || error instanceof NetworkError) {
      throw error;
    }
    
    throw new AuthError('Failed to check user existence', 'USER_CHECK_FAILED', { originalError: error.message });
  }
}

// ------------------ UI STATE MANAGER ------------------
class UIStateManager {
  constructor() {
    this.loadingStates = new Set();
  }

  setLoading(element, isLoading, message = 'Loading...') {
    if (isLoading) {
      this.loadingStates.add(element);
      element.disabled = true;
      element.dataset.originalText = element.textContent;
      element.textContent = message;
      element.classList.add('loading');
    } else {
      this.loadingStates.delete(element);
      element.disabled = false;
      element.textContent = element.dataset.originalText || element.textContent;
      element.classList.remove('loading');
    }
  }

  showMessage(message, type = 'info', duration = 5000) {
    let messageEl = document.getElementById('auth-message');
    if (!messageEl) {
      messageEl = document.createElement('div');
      messageEl.id = 'auth-message';
      messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 16px;
        border-radius: 4px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        max-width: 300px;
        word-wrap: break-word;
      `;
      document.body.appendChild(messageEl);
    }

    const colors = {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    };

    messageEl.style.backgroundColor = colors[type] || colors.info;
    messageEl.textContent = message;
    messageEl.style.display = 'block';

    setTimeout(() => {
      if (messageEl) {
        messageEl.style.display = 'none';
      }
    }, duration);
  }
}

// ------------------ MAIN APPLICATION ------------------
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const privacyCheckbox = document.getElementById("privacy");
  const consentCheckbox = document.getElementById("consent");
  
  if (!loginBtn || !privacyCheckbox || !consentCheckbox) {
    console.error('Required DOM elements not found');
    return;
  }

  const uiManager = new UIStateManager();
  let authStateObserverActive = false;

  const updateButtonState = utils.debounce(() => {
    try {
      const returningUser = localStorage.getItem(CONFIG.STORAGE_KEYS.POLICIES_ACCEPTED) === "true";
      const currentlyAccepted = privacyCheckbox.checked && consentCheckbox.checked;
      
      loginBtn.disabled = !(returningUser || currentlyAccepted);
      loginBtn.title = loginBtn.disabled ? "Please accept both privacy policy and consent terms" : "Sign in with Google";
    } catch (error) {
      console.error('Error updating button state:', error);
    }
  }, 100);

  updateButtonState();
  privacyCheckbox.addEventListener("change", updateButtonState);
  consentCheckbox.addEventListener("change", updateButtonState);

  loginBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    if (loginBtn.disabled) return;

    uiManager.setLoading(loginBtn, true, 'Signing in...');

    try {
      const policiesAccepted = privacyCheckbox.checked && consentCheckbox.checked;
      const storedPoliciesAccepted = localStorage.getItem(CONFIG.STORAGE_KEYS.POLICIES_ACCEPTED) === "true";
      
      if (!storedPoliciesAccepted && !policiesAccepted) {
        throw new AuthError('Please accept both privacy policy and consent terms', 'POLICIES_NOT_ACCEPTED');
      }

      const { user } = await signInWithGoogle();
      console.log("✅ Google sign-in successful:", user);
      if (!user || !user.uid) throw new AuthError('Invalid user data received', 'INVALID_USER_DATA');
      
      const idToken = await utils.retryOperation(() => user.getIdToken(true));

      const banned = await isBannedUser(user.uid, idToken);
      if (banned) throw new AuthError('Your account is banned.', 'USER_BANNED');

      utils.setSecureToken(idToken);
      localStorage.setItem(CONFIG.STORAGE_KEYS.POLICIES_ACCEPTED, "true");

      const adminUser = await isAdmin(user.uid, idToken);
      const existingUser = await checkIfUserExists(user.uid);

      if (adminUser) await utils.safeNavigate(CONFIG.PAGES.ADMIN_DASHBOARD);
      else if (existingUser) await utils.safeNavigate(CONFIG.PAGES.DASHBOARD);
      else await utils.safeNavigate(CONFIG.PAGES.ONBOARDING);

    } catch (error) {
      console.error("❌ Login failed:", error);
      let msg = "Login failed. Please try again.";

      if (error instanceof AuthError) msg = error.message;
      else if (error instanceof NetworkError) msg = error.status >= 500 ? "Server error" : "Network error";

      uiManager.showMessage(msg, 'error');
    } finally {
      uiManager.setLoading(loginBtn, false);
    }
  });

  loginBtn.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && !loginBtn.disabled) {
      e.preventDefault();
      loginBtn.click();
    }
  });

  observeUser(async (user) => {
    if (authStateObserverActive) return;
    authStateObserverActive = true;

    try {
      const currentPath = window.location.pathname;
      if (!user && !currentPath.endsWith("login.html")) {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.ID_TOKEN);
        await utils.safeNavigate(CONFIG.PAGES.LOGIN);
        return;
      }

      const idToken = await utils.retryOperation(() => user.getIdToken(true));
      utils.setSecureToken(idToken);

      const banned = await isBannedUser(user.uid, idToken);
      if (banned) throw new AuthError('Your account has been banned.', 'USER_BANNED');

      const adminUser = await isAdmin(user.uid, idToken);
      const exists = await checkIfUserExists(user.uid);

      if (adminUser) await utils.safeNavigate(CONFIG.PAGES.ADMIN_DASHBOARD);
      else if (exists) await utils.safeNavigate(CONFIG.PAGES.DASHBOARD);
      else await utils.safeNavigate(CONFIG.PAGES.ONBOARDING);

    } catch (error) {
      console.error("[AuthState] Error:", error);
    } finally {
      authStateObserverActive = false;
    }
  });

  window.addEventListener('beforeunload', () => authStateObserverActive = false);

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    uiManager.showMessage('An unexpected error occurred. Please refresh the page.', 'error');
  });
});

export { utils };
export { AuthError, NetworkError, checkIfUserExists, UIStateManager, CONFIG };
