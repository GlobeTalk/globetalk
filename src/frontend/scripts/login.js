// Import the functions you need from the SDKs
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

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
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// DOM elements
const loginBtn = document.getElementById('loginBtn');
const statusMessage = document.getElementById('statusMessage');

// Google Sign-In function
async function loginWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    // Add scopes if needed
    provider.addScope('profile');
    provider.addScope('email');
    
    // Sign in with popup
    const result = await signInWithPopup(auth, provider);
    
    // Show success message
    showStatus('Login successful! Redirecting...', 'success');
    
    // Redirect to another page after successful login
    setTimeout(() => {
      window.location.href = '../pages/onboarding.html'; // Change to your desired redirect URL
    }, 1500);
    
    return result.user;
  } catch (error) {
    console.error("Login error:", error);
    
    // Handle specific errors
    let errorMessage = 'Authentication failed. Please try again.';
    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Login popup was closed before completion.';
    } else if (error.code === 'auth/cancelled-popup-request') {
      errorMessage = 'Login request was cancelled.';
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = 'Login popup was blocked by your browser. Please allow popups for this site.';
    }
    
    showStatus(errorMessage, 'error');
    throw new Error(errorMessage);
  }
}

// Show status message
function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = 'status ' + type;
  
  // Auto-hide error messages after 5 seconds
  if (type === 'error') {
    setTimeout(() => {
      statusMessage.style.display = 'none';
    }, 5000);
  }
}

// Add event listener to login button
loginBtn.addEventListener('click', loginWithGoogle);

// Monitor authentication state
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    console.log('User is signed in:', user);
    // You could redirect automatically if user is already logged in
    // window.location.href = '/chat';
  } else {
    // User is signed out
    console.log('User is signed out');
  }
});

// Export functions for potential use in other modules
window.authModule = {
  login: loginWithGoogle,
  getCurrentUser: () => auth.currentUser,
  logout: () => signOut(auth),
  onAuthStateChanged: (callback) => onAuthStateChanged(auth, callback)
};