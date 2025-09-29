import { signInWithGoogle, observeUser } from "../../services/firebase.js";

// Constants and Configuration
const CONFIG = {
  API_BASE_URL: '/api',
  PAGES: {
    LOGIN: '../../../pages/login.html',
    DASHBOARD: '../../../pages/userdashboard.html',
    ONBOARDING: '../../../pages/onboarding.html'
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

// Error handling with custom error types
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

// Utility functions for better code organization
const utils = {
  // Secure token storage with expiration
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

  // Sanitize and validate user input
  sanitizeUserId(userId) {
    if (!userId || typeof userId !== 'string') {
      throw new AuthError('Invalid user ID', 'INVALID_USER_ID');
    }
    return userId.trim();
  },

  // Safe navigation with loading states
  async safeNavigate(url, loadingElement = null) {
    try {
      if (loadingElement) {
        loadingElement.style.display = 'block';
      }
      
      // Add small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Validate URL before navigation
      if (!url || !url.startsWith('../')) {
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

  // Retry mechanism for API calls
  async retryOperation(operation, maxAttempts = CONFIG.RETRY_CONFIG.MAX_ATTEMPTS) {
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

  // Debounce function for UI interactions
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

// User existence check with caching and error handling
async function checkIfUserExists(userId) {
  try {
    const sanitizedUserId = utils.sanitizeUserId(userId);
    
    return await utils.retryOperation(async () => {
      const token = utils.getSecureToken();
      if (!token) {
        throw new AuthError('No valid authentication token', 'NO_TOKEN');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/users/${sanitizedUserId}/exists`, {
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
          throw new NetworkError(
            `Server error: ${response.status}`, 
            response.status, 
            errorData
          );
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

// Enhanced UI state management
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
    // Create or update message element
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

    // Set message type styles
    const colors = {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    };

    messageEl.style.backgroundColor = colors[type] || colors.info;
    messageEl.textContent = message;
    messageEl.style.display = 'block';

    // Auto-hide message
    setTimeout(() => {
      if (messageEl) {
        messageEl.style.display = 'none';
      }
    }, duration);
  }
}

//  Main application logic
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const privacyCheckbox = document.getElementById("privacy");
  const consentCheckbox = document.getElementById("consent");
  
  // Validate required elements
  if (!loginBtn || !privacyCheckbox || !consentCheckbox) {
    console.error('Required DOM elements not found');
    return;
  }

  const uiManager = new UIStateManager();
  let authStateObserverActive = false;

  // Button state management with debouncing
  const updateButtonState = utils.debounce(() => {
    try {
      const returningUser = localStorage.getItem(CONFIG.STORAGE_KEYS.POLICIES_ACCEPTED) === "true";
      const currentlyAccepted = privacyCheckbox.checked && consentCheckbox.checked;
      
      loginBtn.disabled = !(returningUser || currentlyAccepted);
      
      // Update UI feedback
      if (loginBtn.disabled && !returningUser) {
        loginBtn.title = "Please accept both privacy policy and consent terms";
      } else {
        loginBtn.title = "Sign in with Google";
      }
    } catch (error) {
      console.error('Error updating button state:', error);
    }
  }, 100);

  updateButtonState();
  privacyCheckbox.addEventListener("change", updateButtonState);
  consentCheckbox.addEventListener("change", updateButtonState);

  // Google Login Flow
  loginBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    
    if (loginBtn.disabled) return;

    uiManager.setLoading(loginBtn, true, 'Signing in...');

    try {
      // Validate policies acceptance
      const policiesAccepted = privacyCheckbox.checked && consentCheckbox.checked;
      const storedPoliciesAccepted = localStorage.getItem(CONFIG.STORAGE_KEYS.POLICIES_ACCEPTED) === "true";
      
      if (!storedPoliciesAccepted && !policiesAccepted) {
        throw new AuthError('Please accept both privacy policy and consent terms', 'POLICIES_NOT_ACCEPTED');
      }

      // Firebase sign-in with timeout
      const signInPromise = signInWithGoogle();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new AuthError('Sign-in timeout', 'SIGNIN_TIMEOUT')), 30000)
      );
      
      const { user } = await Promise.race([signInPromise, timeoutPromise]);
      
      if (!user || !user.uid) {
        throw new AuthError('Invalid user data received', 'INVALID_USER_DATA');
      }

      // Get fresh token with retry
      const idToken = await utils.retryOperation(async () => {
        const token = await user.getIdToken(true);
        if (!token) {
          throw new AuthError('Failed to get authentication token', 'TOKEN_FAILED');
        }
        return token;
      });

      console.log("User signed in:", user.displayName);
      
      // Store token securely
      utils.setSecureToken(idToken);
      localStorage.setItem(CONFIG.STORAGE_KEYS.POLICIES_ACCEPTED, "true");

      uiManager.showMessage(`Welcome, ${user.displayName}!`, 'success');
      
      // Check user existence with proper error handling
      uiManager.setLoading(loginBtn, true, 'Checking account...');
      
      const isExistingUser = await checkIfUserExists(user.uid);
      
      // Navigate based on user status
      if (isExistingUser === true) {
        console.log("[Login] Existing user, redirecting to dashboard");
        await utils.safeNavigate(CONFIG.PAGES.DASHBOARD);
      } else if (isExistingUser === false) {
        console.log("[Login] New user, redirecting to onboarding");
        await utils.safeNavigate(CONFIG.PAGES.ONBOARDING);
      }

    } catch (error) {
      console.error("❌ Login failed:", error);
      
      let userMessage = "Login failed. Please try again.";
      
      if (error instanceof AuthError) {
        switch (error.code) {
          case 'POLICIES_NOT_ACCEPTED':
            userMessage = "Please accept both privacy policy and consent terms.";
            break;
          case 'SIGNIN_TIMEOUT':
            userMessage = "Sign-in timed out. Please check your connection and try again.";
            break;
          case 'NO_TOKEN':
            userMessage = "Authentication failed. Please refresh the page and try again.";
            break;
          default:
            userMessage = error.message || userMessage;
        }
      } else if (error instanceof NetworkError) {
        if (error.status >= 500) {
          userMessage = "Server error. Please try again later.";
        } else if (error.status === 401) {
          userMessage = "Authentication failed. Please refresh the page and try again.";
        } else {
          userMessage = "Network error. Please check your connection.";
        }
      }
      
      uiManager.showMessage(userMessage, 'error');
    } finally {
      uiManager.setLoading(loginBtn, false);
    }
  });

  // Enhanced keyboard accessibility
  loginBtn.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && !loginBtn.disabled) {
      e.preventDefault();
      loginBtn.click();
    }
  });

  // Enhanced auth state observer with duplicate prevention
  observeUser(async (user) => {
    // Prevent multiple simultaneous auth state changes
    if (authStateObserverActive) {
      console.log("[AuthState] Observer already active, skipping...");
      return;
    }
    
    authStateObserverActive = true;
    
    try {
      console.log("[AuthState] Auth state changed. User:", user ? user.email : "null");
      
      if (user) {
        // Validate user object
        if (!user.uid || !user.email) {
          throw new AuthError('Invalid user object received', 'INVALID_USER_OBJECT');
        }

        // Get fresh token with error handling
        const idToken = await utils.retryOperation(async () => {
          return await user.getIdToken(true);
        });
        
        utils.setSecureToken(idToken);
        console.log("👤 Logged in as:", user.email);

        // Only check user existence and redirect if policies are accepted
        if (localStorage.getItem(CONFIG.STORAGE_KEYS.POLICIES_ACCEPTED) === "true") {
          const exists = await checkIfUserExists(user.uid);
          console.log("[AuthState] User exists?", exists);
          
          if (exists === true) {
            console.log("[AuthState] Redirecting to dashboard");
            await utils.safeNavigate(CONFIG.PAGES.DASHBOARD);
          } else if (exists === false) {
            console.log("[AuthState] Redirecting to onboarding");
            await utils.safeNavigate(CONFIG.PAGES.ONBOARDING);
          }
        }
      } else {
        console.log("🚪 Not logged in");
        
        // Clean up stored data
        localStorage.removeItem(CONFIG.STORAGE_KEYS.ID_TOKEN);
        
        // Only redirect if not already on login page
        if (!window.location.pathname.endsWith("login.html")) {
          console.log("Redirecting to login page");
          await utils.safeNavigate(CONFIG.PAGES.LOGIN);
        }
      }
    } catch (error) {
      console.error("[AuthState] Error in auth state observer:", error);
      
      if (error instanceof AuthError && error.code === 'NAVIGATION_ERROR') {
        uiManager.showMessage("Navigation error. Please refresh the page.", 'error');
      }
    } finally {
      authStateObserverActive = false;
    }
  });

  // Enhanced cleanup and error recovery
  window.addEventListener('beforeunload', () => {
    // Clean up any ongoing operations
    authStateObserverActive = false;
  });

  // Global error handler for unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    if (event.reason instanceof AuthError || event.reason instanceof NetworkError) {
      uiManager.showMessage('An unexpected error occurred. Please refresh the page.', 'error');
    }
  });
});