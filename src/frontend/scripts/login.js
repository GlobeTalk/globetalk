// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCtAw-A06ZJvKXfbfpNu9D8rYurdgX0sVk",
  authDomain: "globetalk-2508c.firebaseapp.com",
  projectId: "globetalk-2508c",
  storageBucket: "globetalk-2508c.firebasestorage.app",
  messagingSenderId: "1046584624165",
  appId: "1:1046584624165:web:6ed616da6aafdb52ddebcc"
};

// Initialize Firebase
let app;
let auth;

try {
  // Check if Firebase is already initialized to avoid errors
  app = firebase.apps.length ? firebase.apps[0] : firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
} catch (error) {
  console.error("Firebase initialization error:", error);
  app = firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
}

// Google Sign-In function
async function login() {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    // Add scopes if needed
    provider.addScope('profile');
    provider.addScope('email');
    
    // Sign in with popup
    const result = await auth.signInWithPopup(provider);
    return result.user;
  } catch (error) {
    console.error("Login error:", error);
    
    // Handle specific errors
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Login popup was closed before completion.');
    } else if (error.code === 'auth/cancelled-popup-request') {
      throw new Error('Login request was cancelled.');
    } else {
      throw new Error('Authentication failed. Please try again.');
    }
  }
}

// Get DOM elements after page loads
document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('loginBtn');
  const statusMessage = document.getElementById('statusMessage');
  
  loginBtn.addEventListener('click', async () => {
    try {
      loginBtn.disabled = true;
      loginBtn.innerHTML = 'Signing in...';
      
      const user = await login();
      
      if (user) {
        statusMessage.textContent = `Welcome, ${user.displayName}! Redirecting...`;
        statusMessage.className = 'status success';

        // Redirect to onboarding page after successful login
        setTimeout(() => {
          window.location.href = '../pages/onboarding.html';
        }, 1500);
      } else {
        statusMessage.textContent = 'Login failed. Please try again.';
        statusMessage.className = 'status error';
        resetLoginButton();
      }
    } catch (error) {
      console.error("Login error:", error);
      statusMessage.textContent = `Error: ${error.message}`;
      statusMessage.className = 'status error';
      resetLoginButton();
    }
  });
  
  function resetLoginButton() {
    loginBtn.disabled = false;
    loginBtn.innerHTML = `
      <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      </svg>
      Sign in with Google
    `;
  }
});

// Additional auth functions
function getCurrentUser() {
  return auth.currentUser;
}

function logout() {
  return auth.signOut();
}

function onAuthStateChanged(callback) {
  return auth.onAuthStateChanged(callback);
}

// Export functions for testing or other modules
export { login, getCurrentUser, logout, onAuthStateChanged };