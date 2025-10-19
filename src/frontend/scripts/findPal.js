import { auth, logout } from '../../services/firebase.js';

// Configuration
const CONFIG = {
    API_TIMEOUT: 15000,
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
    BACKEND_URL: 'https://binarybandits-matchmakingapi.onrender.com'
};

// Utility: Delay function for retries
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Utility: Fetch with timeout
async function fetchWithTimeout(url, options = {}, timeout = CONFIG.API_TIMEOUT) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('Request timed out. Please check your connection.');
        }
        throw error;
    }
}

// Utility: Retry logic
async function fetchWithRetry(url, options = {}, retries = CONFIG.MAX_RETRIES) {
    let lastError;
    
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetchWithTimeout(url, options);
            return response;
        } catch (error) {
            lastError = error;
            console.warn(`Attempt ${i + 1} failed:`, error.message);
            
            if (i < retries - 1) {
                await delay(CONFIG.RETRY_DELAY * Math.pow(2, i)); // Exponential backoff
            }
        }
    }
    
    throw lastError;
}

// Load languages with robust error handling
async function languageList() {
    const dropdown = document.getElementById("language");
    if (!dropdown) {
        console.error("Language dropdown not found");
        return;
    }
    
    dropdown.innerHTML = '<option value="">Loading languages...</option>';
    dropdown.disabled = true;
    
    try {
        const response = await fetchWithRetry(
            "https://api.languagetoolplus.com/v2/languages",
            {},
            2 // Fewer retries for initial load
        );
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const languages = await response.json();
        
        // Validate response
        if (!Array.isArray(languages) || languages.length === 0) {
            throw new Error("Invalid language data received");
        }

        // Process languages
        const uniqueNames = new Set();
        languages.forEach(lang => {
            if (lang && lang.name && typeof lang.name === 'string') {
                uniqueNames.add(lang.name.split("(")[0].trim());
            }
        });
        
        if (uniqueNames.size === 0) {
            throw new Error("No valid languages found");
        }

        const sortedLanguages = Array.from(uniqueNames).sort();

        // Populate dropdown
        dropdown.innerHTML = '<option value="">-- Select Language --</option>';
        sortedLanguages.forEach(langName => {
            const option = document.createElement("option");
            option.textContent = langName;
            option.value = langName.toLowerCase().replace(/\s+/g, '-');
            dropdown.appendChild(option);
        });
        
        dropdown.disabled = false;
        
    } catch (error) {
        console.error("Error loading languages:", error);
        
        // Fallback to basic language list
        const fallbackLanguages = [
            'english', 'spanish', 'french', 'german', 'italian',
            'portuguese', 'chinese', 'japanese', 'korean', 'arabic'
        ];
        
        dropdown.innerHTML = '<option value="">-- Select Language --</option>';
        fallbackLanguages.forEach(langName => {
            const option = document.createElement("option");
            option.textContent = langName;
            option.value = langName.toLowerCase();
            dropdown.appendChild(option);
        });
        
        dropdown.disabled = false;
        showError('Languages loaded from cache. Some options may be limited.', 3000);
    }
}

// Setup logout with error handling
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (!logoutBtn) {
        console.warn("Logout button not found");
        return;
    }

    logoutBtn.addEventListener('click', async e => {
        e.preventDefault();
        
        // Prevent double-clicks
        if (logoutBtn.disabled) return;
        logoutBtn.disabled = true;
        
        const originalText = logoutBtn.textContent;
        logoutBtn.textContent = 'Logging out...';
        
        try {
            await logout();
            window.location.href = '../pages/login.html';
        } catch (error) {
            console.error("Logout error:", error);
            showError('Logout failed. Redirecting anyway...');
            
            // Force redirect after delay even if logout fails
            setTimeout(() => {
                window.location.href = '../pages/login.html';
            }, 1500);
        } finally {
            logoutBtn.disabled = false;
            logoutBtn.textContent = originalText;
        }
    });
}

// Validate form inputs
function validateFormInputs(language, region, interest) {
    const errors = [];
    
    if (!language || language.trim() === '') {
        errors.push('Please select a language');
    }
    
    if (!region || region.trim() === '') {
        errors.push('Please select a region');
    }
    
    if (!interest || interest.trim() === '') {
        errors.push('Please select an interest');
    }
    
    return errors;
}

// Show error message
function showError(message, duration = 5000) {
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    
    if (errorMessage && errorText) {
        errorText.textContent = message;
        errorMessage.classList.add('show');
        
        if (duration > 0) {
            setTimeout(() => errorMessage.classList.remove('show'), duration);
        }
    }
}

// Show success message
function showSuccess(message, duration = 3000) {
    const successMessage = document.getElementById('successMessage');
    
    if (successMessage) {
        const textSpan = successMessage.querySelector('span:last-child');
        if (textSpan) textSpan.textContent = message;
        
        successMessage.classList.add('show');
        
        if (duration > 0) {
            setTimeout(() => successMessage.classList.remove('show'), duration);
        }
    }
}

// Setup form with comprehensive validation and error handling
function setupForm() {
    const form = document.getElementById('penpalForm');
    if (!form) {
        console.error("Form not found");
        return;
    }

    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');

    form.addEventListener('submit', async e => {
        e.preventDefault();

        // Clear previous messages
        successMessage?.classList.remove('show');
        errorMessage?.classList.remove('show');

        // Get form values with sanitization
        const language = form.language?.value?.trim() || '';
        const region = form.region?.value?.trim() || '';
        const interest = form.interest?.value?.trim() || '';

        // Validate inputs
        const validationErrors = validateFormInputs(language, region, interest);
        if (validationErrors.length > 0) {
            showError(validationErrors.join('. '));
            return;
        }

        // Disable form during submission
        submitBtn.disabled = true;
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<span class="loading-spinner"></span>Searching...';

        // Disable all form inputs
        const formInputs = form.querySelectorAll('select');
        formInputs.forEach(input => input.disabled = true);

        try {
            // Check authentication
            const user = auth.currentUser;
            if (!user) {
                throw new Error('You must be logged in to find a pen pal');
            }

            // Get ID token with timeout
            const idToken = await Promise.race([
                user.getIdToken(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Authentication timeout')), 5000)
                )
            ]);

            showSuccess('Searching for your perfect match...');

            // Make API request with retry logic
            const response = await fetchWithRetry(CONFIG.BACKEND_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${idToken}`
                },
                body: JSON.stringify({ 
                    language: language.toLowerCase(), 
                    region, 
                    interest 
                })
            });

            // Handle non-OK responses
            if (!response.ok) {
                let errorMessage = 'Matchmaking failed';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorData.message || errorMessage;
                } catch {
                    errorMessage = `Server error (${response.status})`;
                }
                throw new Error(errorMessage);
            }

            // Parse response
            const data = await response.json();
            
            if (!data) {
                throw new Error('Invalid response from server');
            }

            // Handle match result
            if (data.match) {
                const matchName = data.match.username || data.match.name || data.match.id || 'a pen pal';
                showSuccess(`Great! You've been matched with ${matchName}!`);
                
                setTimeout(() => {
                    window.location.href = 'userdashboard.html';
                }, 2000);
            } else {
                showError('No matches found. Try adjusting your preferences or check back later!', 0);
                formInputs.forEach(input => input.disabled = false);
            }

        } catch (err) {
            console.error("Error finding pen pal:", err);
            
            // User-friendly error messages
            let userMessage = 'Something went wrong. Please try again.';
            
            if (err.message.includes('logged in')) {
                userMessage = 'Please log in to continue.';
                setTimeout(() => window.location.href = '../pages/login.html', 2000);
            } else if (err.message.includes('timeout') || err.message.includes('timed out')) {
                userMessage = 'Connection timeout. Please check your internet and try again.';
            } else if (err.message.includes('Network') || err.message.includes('Failed to fetch')) {
                userMessage = 'Network error. Please check your connection.';
            } else if (err.message) {
                userMessage = err.message;
            }
            
            showError(userMessage, 0);
            formInputs.forEach(input => input.disabled = false);
            
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });

    // Clear error on input change
    const formInputs = form.querySelectorAll('select');
    formInputs.forEach(input => {
        input.addEventListener('change', () => {
            errorMessage?.classList.remove('show');
        });
    });
}

// Check authentication status
function checkAuthStatus() {
    return new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            unsubscribe();
            if (!user) {
                console.warn('User not authenticated');
                window.location.href = '../pages/login.html';
            }
            resolve(user);
        }, error => {
            console.error('Auth state error:', error);
            unsubscribe();
            resolve(null);
        });
    });
}

// Initialize application
async function initialize() {
    try {
        // Check authentication first
        await checkAuthStatus();
        
        // Initialize components
        await languageList();
        setupLogout();
        setupForm();
        
        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Initialization error:', error);
        showError('Failed to initialize application. Please refresh the page.');
    }
}

// Start application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}