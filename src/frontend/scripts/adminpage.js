import {
  getActiveUserCount,
  getReportedUserCount,
  getBannedUserCount,
  getUnresolvedReports,
  getResolvedReports,
  getBannedUsers,
  banUser,
  unbanUser,
  dissmissReport
} from "/src/services/admin.js";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "/src/services/firebase.js";

// --- Constants ---
const CONFIG = {
  DEBOUNCE_DELAY: 300,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  MODAL_Z_INDEX: 9999,
  LOADING_TIMEOUT: 10000,
  DATE_FORMAT: {
    timeZone: "Africa/Johannesburg",
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
};

const STATES = {
  LOADING: 'loading',
  ERROR: 'error',
  SUCCESS: 'success',
  IDLE: 'idle'
};

// --- State Management ---
class AdminDashboardState {
  constructor() {
    this.currentView = 'unresolved';
    this.isLoading = false;
    this.error = null;
    this.counts = { active: 0, reported: 0, banned: 0 };
    this.reports = [];
    this.bannedUsers = [];
    this.listeners = new Map();
  }

  setState(key, value) {
    this[key] = value;
    this.notifyListeners(key, value);
  }

  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);
  }

  unsubscribe(key, callback) {
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  notifyListeners(key, value) {
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(value);
        } catch (error) {
          console.error(`Error in listener for ${key}:`, error);
        }
      });
    }
  }
}

const appState = new AdminDashboardState();

// --- Utilities ---
class Logger {
  static log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logData = data ? { message, data, timestamp } : { message, timestamp };
    
    switch (level) {
      case 'error':
        console.error(`[${timestamp}] ERROR:`, logData);
        break;
      case 'warn':
        console.warn(`[${timestamp}] WARN:`, logData);
        break;
      case 'info':
        console.info(`[${timestamp}] INFO:`, logData);
        break;
      default:
        console.log(`[${timestamp}] LOG:`, logData);
    }
  }

  static error(message, data) { this.log('error', message, data); }
  static warn(message, data) { this.log('warn', message, data); }
  static info(message, data) { this.log('info', message, data); }
}

function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

async function retryOperation(operation, maxRetries = CONFIG.MAX_RETRIES) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      Logger.warn(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
        const delay = CONFIG.RETRY_DELAY * attempt;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/<[^>]*>/g, '');
}

function validateUserId(userId) {
  return userId && typeof userId === 'string' && userId.trim().length > 0;
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// --- Error Handling ---
class AppError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR', details = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

function handleError(error, context = 'Unknown') {
  Logger.error(`Error in ${context}:`, {
    message: error.message,
    stack: error.stack,
    code: error.code || 'UNKNOWN'
  });

  // Show user-friendly error message
  const userMessage = getUserFriendlyErrorMessage(error);
  showNotification(userMessage, 'error');
}

function getUserFriendlyErrorMessage(error) {
  const errorMessages = {
    'PERMISSION_DENIED': 'You do not have permission to perform this action.',
    'NETWORK_ERROR': 'Network connection failed. Please check your internet connection.',
    'TIMEOUT': 'Operation timed out. Please try again.',
    'VALIDATION_ERROR': 'Invalid input provided. Please check your data.',
    'USER_NOT_FOUND': 'User not found.',
    'ALREADY_BANNED': 'User is already banned.',
    'BAN_FAILED': 'Failed to ban user. Please try again.',
    'UNBAN_FAILED': 'Failed to unban user. Please try again.'
  };

  return errorMessages[error.code] || 'An unexpected error occurred. Please try again.';
}

// --- UI Components ---
function showNotification(message, type = 'info', duration = 5000) {
  // Remove existing notifications
  const existing = document.querySelectorAll('.notification');
  existing.forEach(el => el.remove());

  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: ${CONFIG.MODAL_Z_INDEX + 1};
    max-width: 400px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;

  const colors = {
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3'
  };

  notification.style.background = colors[type] || colors.info;
  notification.textContent = message;

  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 10);

  // Auto remove
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    }
  }, duration);

  // Click to dismiss
  notification.addEventListener('click', () => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => notification.remove(), 300);
  });
}

function showLoadingSpinner(container, message = 'Loading...') {
  if (!container) return;
  
  container.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;padding:3rem;color:#666;">
      <div style="
        width:40px;
        height:40px;
        border:4px solid #e0e0e0;
        border-top:4px solid #2196f3;
        border-radius:50%;
        animation:spin 1s linear infinite;
        margin-bottom:1rem;
      "></div>
      <div>${message}</div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </div>
  `;
}

// --- Date Formatting ---
function formatDate(timestamp) {
  if (!timestamp) return "Unknown";
  
  try {
    let date;
    
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else {
      return "Invalid Date";
    }

    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }

    return date.toLocaleString("en-GB", CONFIG.DATE_FORMAT);
  } catch (error) {
    Logger.error('Date formatting error:', error);
    return "Format Error";
  }
}

// --- Admin Operations ---
async function getAdminCounts() {
  try {
    appState.setState('isLoading', true);
    
    const [active, reported, banned] = await Promise.allSettled([
      retryOperation(() => getActiveUserCount()),
      retryOperation(() => getReportedUserCount()),
      retryOperation(() => getBannedUserCount())
    ]);

    const counts = {
      active: active.status === 'fulfilled' ? active.value : 0,
      reported: reported.status === 'fulfilled' ? reported.value : 0,
      banned: banned.status === 'fulfilled' ? banned.value : 0
    };

    // Log any failures
    if (active.status === 'rejected') Logger.error('Failed to get active user count:', active.reason);
    if (reported.status === 'rejected') Logger.error('Failed to get reported user count:', reported.reason);
    if (banned.status === 'rejected') Logger.error('Failed to get banned user count:', banned.reason);

    appState.setState('counts', counts);
    return counts;
  } catch (error) {
    throw new AppError('Failed to load admin counts', 'COUNTS_LOAD_FAILED', error);
  } finally {
    appState.setState('isLoading', false);
  }
}

async function performBanUser(userId,reporterUid, reportId, report, reason, reportedDate) {
  if (!validateUserId(userId)) {
    throw new AppError('Invalid user ID', 'VALIDATION_ERROR');
  }

  const sanitizedReason = sanitizeInput(reason);
  if (!sanitizedReason) {
    throw new AppError('Ban reason is required', 'VALIDATION_ERROR');
  }

  try {
    const result = await retryOperation(async () => {
      const adminId = (auth.currentUser && auth.currentUser.uid) || null;
      return await banUser(userId, reporterUid, reportId, report, sanitizedReason, reportedDate, adminId);
    });

    if (!result || !result.success) {
      throw new AppError('Ban operation failed', 'BAN_FAILED');
    }

    Logger.info('User banned successfully:', { userId, reportId });
    showNotification(`User ${userId} has been banned successfully.`, 'success');
    
    return result;
  } catch (error) {
    Logger.error('Ban user error:', { userId, error });
    throw new AppError('Failed to ban user', 'BAN_FAILED', error);
  }
}

async function performUnbanUser(userId) {
  if (!validateUserId(userId)) {
    throw new AppError('Invalid user ID', 'VALIDATION_ERROR');
  }

  try {
    const result = await retryOperation(async () => {
      return await unbanUser(userId);
    });

    if (!result || !result.success) {
      throw new AppError('Unban operation failed', 'UNBAN_FAILED');
    }

    Logger.info('User unbanned successfully:', { userId });
    showNotification(`User ${userId} has been unbanned successfully.`, 'success');
    
    return result;
  } catch (error) {
    Logger.error('Unban user error:', { userId, error });
    throw new AppError('Failed to unban user', 'UNBAN_FAILED', error);
  }
}

// --- Toggle Container ---
function createToggleContainer() {
  const container = document.createElement("div");
  container.className = "toggle-container";
  container.setAttribute('role', 'tablist');
  container.style.cssText = `
    display: flex;
    gap: 1.5rem;
    margin-bottom: 2.5rem;
    justify-content: center;
    align-items: center;
  `;

  const buttons = [
    { text: "Unresolved Reports", type: "unresolved", active: true },
    { text: "Resolved Reports", type: "resolved", active: false }
  ];

  const buttonElements = buttons.map(({ text, type, active }) => {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.className = `toggle-btn ${active ? 'active' : ''}`;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', active.toString());
    btn.setAttribute('data-type', type);
    btn.style.cssText = `
      background: ${active ? 'var(--globetalk-card-blue)' : '#e0e0e0'};
      color: ${active ? '#fff' : '#333'};
      border: none;
      padding: 1rem 2.5rem;
      border-radius: 20px;
      font-size: 1.25rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      outline: none;
    `;

    // Add hover effects
    btn.addEventListener('mouseenter', () => {
      if (!btn.classList.contains('active')) {
        btn.style.background = '#d0d0d0';
      }
    });

    btn.addEventListener('mouseleave', () => {
      if (!btn.classList.contains('active')) {
        btn.style.background = '#e0e0e0';
      }
    });

    btn.addEventListener('focus', () => {
      btn.style.boxShadow = '0 0 0 2px rgba(33, 150, 243, 0.5)';
    });

    btn.addEventListener('blur', () => {
      btn.style.boxShadow = 'none';
    });

    return btn;
  });

  const debouncedRenderReports = debounce(renderReports, CONFIG.DEBOUNCE_DELAY);

  function setActive(activeBtn) {
    buttonElements.forEach(btn => {
      const isActive = btn === activeBtn;
      btn.style.background = isActive ? 'var(--globetalk-card-blue)' : '#e0e0e0';
      btn.style.color = isActive ? '#fff' : '#333';
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive.toString());
    });
  }

  buttonElements.forEach(btn => {
    btn.addEventListener("click", () => {
      const type = btn.getAttribute('data-type');
      setActive(btn);
      appState.setState('currentView', type);
      debouncedRenderReports(type);
    });

    // Keyboard navigation
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });

  buttonElements.forEach(btn => container.appendChild(btn));
  return container;
}

// --- Modals ---
function createModal(id, content, options = {}) {
  const existingModal = document.getElementById(id);
  if (existingModal) existingModal.remove();

  const modal = document.createElement("div");
  modal.id = id;
  modal.className = "modal";
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', `${id}-title`);
  
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: ${CONFIG.MODAL_Z_INDEX};
    opacity: 0;
    transition: opacity 0.3s ease;
  `;

  modal.innerHTML = content;
  document.body.appendChild(modal);

  // Animate in
  setTimeout(() => {
    modal.style.opacity = '1';
  }, 10);

  // Focus management
  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  if (focusableElements.length > 0) {
    focusableElements[0].focus();
  }

  // Escape key handling
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  };

  const closeModal = () => {
    modal.style.opacity = '0';
    setTimeout(() => {
      if (modal.parentNode) {
        modal.remove();
      }
    }, 300);
    document.removeEventListener('keydown', handleEscape);
  };

  // Event listeners
  document.addEventListener('keydown', handleEscape);
  
  if (!options.preventOutsideClick) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  return { modal, closeModal };
}

function showBannedUsersModal(bannedUsers) {
  const content = `
    <div style="background:#fff;padding:2.5rem 2rem;border-radius:20px;min-width:320px;max-width:90vw;max-height:80vh;box-shadow:0 10px 30px rgba(0,0,0,0.2);display:flex;flex-direction:column;">
      <h2 id="bannedUsersModal-title" style="margin-bottom:1.5rem;font-size:2rem;">Banned Accounts (${bannedUsers.length})</h2>
      <div style="flex:1;max-height:50vh;overflow-y:auto;margin-bottom:1.5rem;">
        ${bannedUsers.length === 0 ? 
          '<div style="text-align:center;padding:2rem;color:#666;">No banned accounts found.</div>' :
          `<ul style="list-style:none;padding:0;margin:0;">
            ${bannedUsers.map(user => `
              <li style="margin-bottom:1.25rem;display:flex;align-items:center;justify-content:space-between;gap:1.5rem;padding:1rem;border:1px solid #e0e0e0;border-radius:8px;">
                <div style="flex:1;min-width:0;">
                  <div style="font-weight:500;word-break:break-all;">${sanitizeInput(user.email || user.id || 'Unknown User')}</div>
                  <div style="color:#888;font-size:0.9rem;margin-top:0.25rem;">Banned: ${formatDate(user.banDate)}</div>
                  ${user.banReason ? `<div style="color:#666;font-size:0.85rem;margin-top:0.25rem;">Reason: ${sanitizeInput(user.banReason)}</div>` : ''}
                </div>
                <button class="unban-btn" data-id="${user.id}" style="background:#4caf50;color:#fff;border:none;padding:0.75rem 1.5rem;border-radius:8px;font-size:0.9rem;cursor:pointer;white-space:nowrap;transition:background 0.2s;">
                  Unban
                </button>
              </li>
            `).join('')}
          </ul>`
        }
      </div>
      <button id="closeBannedModalBtn" style="background:#f5f5f5;color:#333;border:1px solid #ddd;padding:1rem 2rem;border-radius:12px;font-size:1.1rem;cursor:pointer;transition:background 0.2s;">Close</button>
    </div>
  `;

  const { modal, closeModal } = createModal('bannedUsersModal', content);

  // Unban button handlers
  modal.querySelectorAll(".unban-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const userId = btn.dataset.id;
      if (!validateUserId(userId)) {
        showNotification('Invalid user ID', 'error');
        return;
      }

      const originalText = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Unbanning...';
      btn.style.background = '#ccc';

      try {
        await performUnbanUser(userId);
        
        // Remove the user from the list
        const listItem = btn.closest('li');
        if (listItem) {
          listItem.style.opacity = '0';
          setTimeout(() => listItem.remove(), 300);
        }

        // Update counts
        await getAdminCounts();
        updateCountsDisplay();
      } catch (error) {
        handleError(error, 'Unban User');
        btn.disabled = false;
        btn.textContent = originalText;
        btn.style.background = '#4caf50';
      }
    });

    // Hover effects
    btn.addEventListener('mouseenter', () => {
      if (!btn.disabled) {
        btn.style.background = '#45a049';
      }
    });

    btn.addEventListener('mouseleave', () => {
      if (!btn.disabled) {
        btn.style.background = '#4caf50';
      }
    });
  });

  // Close button
  const closeBtn = modal.querySelector('#closeBannedModalBtn');
  closeBtn.addEventListener('click', closeModal);
  closeBtn.addEventListener('mouseenter', () => {
    closeBtn.style.background = '#e0e0e0';
  });
  closeBtn.addEventListener('mouseleave', () => {
    closeBtn.style.background = '#f5f5f5';
  });
}

function createUserModal({ userid, dateStr, report, reportID }, onBan) {
  const content = `
    <div style="background:#fff;padding:2.5rem 2rem;border-radius:20px;min-width:320px;max-width:90vw;box-shadow:0 10px 30px rgba(0,0,0,0.2);">
      <h2 id="manageUserModal-title" style="margin-bottom:1.5rem;font-size:2rem;">Manage User</h2>
      <div style="margin-bottom:1rem;font-size:1.1rem;"><strong>Username:</strong> <span style="word-break:break-all;">${sanitizeInput(userid)}</span></div>
      <div style="margin-bottom:1rem;font-size:1.1rem;"><strong>Date:</strong> ${sanitizeInput(dateStr)}</div>
      <div style="margin-bottom:2rem;font-size:1.1rem;"><strong>Report:</strong> <div style="background:#f5f5f5;padding:1rem;border-radius:8px;margin-top:0.5rem;word-break:break-word;">${sanitizeInput(report)}</div></div>
      
      <div style="margin-bottom:2rem;">
        <label for="banReason" style="display:block;margin-bottom:0.5rem;font-weight:500;">Ban/Dismiss Reason (required):</label>
        <textarea id="banReason" placeholder="Enter reason for banning this user..." style="width:100%;min-height:80px;padding:0.75rem;border:1px solid #ddd;border-radius:8px;resize:vertical;font-family:inherit;"></textarea>
      </div>
      
      <div style="display:flex;gap:1rem;flex-wrap:wrap;">
        <button id="banUserBtn" style="background:#d32f2f;color:#fff;border:none;padding:1rem 2rem;border-radius:12px;font-size:1.1rem;cursor:pointer;transition:background 0.2s;flex:1;min-width:120px;">Ban User</button>
        <button id="dismissUserBtn" style="background:#ff9800;color:#fff;border:none;padding:1rem 2rem;border-radius:12px;font-size:1.1rem;cursor:pointer;transition:background 0.2s;flex:1;min-width:120px;">Dismiss Report</button>
        <button id="closeModalBtn" style="background:#f5f5f5;color:#333;border:1px solid #ddd;padding:1rem 2rem;border-radius:12px;font-size:1.1rem;cursor:pointer;transition:background 0.2s;flex:1;min-width:120px;">Cancel</button>
      </div>
    </div>
  `;

  const { modal, closeModal } = createModal('manageUserModal', content, { preventOutsideClick: true });

  const banReasonTextarea = modal.querySelector('#banReason');
  const banUserBtn = modal.querySelector('#banUserBtn');
  const dismissUserBtn = modal.querySelector('#dismissUserBtn');
  const closeBtn = modal.querySelector('#closeModalBtn');

  // Real-time validation
  banReasonTextarea.addEventListener('input', () => {
    const reason = banReasonTextarea.value.trim();
    banUserBtn.disabled = !reason;
    banUserBtn.style.background = reason ? '#d32f2f' : '#ccc';
    dismissUserBtn.disabled = !reason;
    dismissUserBtn.style.background = reason ? '#ff9800' : '#ccc';
  });

  // Initial validation
  banUserBtn.disabled = true;
  banUserBtn.style.background = '#ccc';
  dismissUserBtn.disabled = true;
  dismissUserBtn.style.background = '#ccc';

  // Ban user handler
  banUserBtn.addEventListener('click', async () => {
    const reason = sanitizeInput(banReasonTextarea.value);
    
    if (!reason) {
      showNotification('Please provide a reason for banning this user.', 'error');
      banReasonTextarea.focus();
      return;
    }

    const originalText = banUserBtn.textContent;
    banUserBtn.disabled = true;
    banUserBtn.textContent = 'Banning...';
    banUserBtn.style.background = '#ccc';

    try {
      await onBan(reason);
      closeModal();
    } catch (error) {
      handleError(error, 'Ban User');
      banUserBtn.disabled = false;
      banUserBtn.textContent = originalText;
      banUserBtn.style.background = '#d32f2f';
    }
  });

  // Dismiss report handler
  dismissUserBtn.addEventListener('click', async () => {
    const reason = sanitizeInput(banReasonTextarea.value);
    if (!reason) {
      showNotification('Please provide a reason for dismissing this report.', 'error');
      banReasonTextarea.focus();
      return;
    }
    const originalText = dismissUserBtn.textContent;
    dismissUserBtn.disabled = true;
    dismissUserBtn.textContent = 'Dismissing...';
    dismissUserBtn.style.background = '#ccc';
    try {
      // Use the global performDissmissReport function
      await performDissmissReport(reportID, reason);
      showNotification('Report dismissed successfully.', 'success');
      closeModal();
      await renderReports('unresolved');
    } catch (error) {
      handleError(error, 'Dismiss Report');
      dismissUserBtn.disabled = false;
      dismissUserBtn.textContent = originalText;
      dismissUserBtn.style.background = '#ff9800';
    }
  });

  // Close handler
  closeBtn.addEventListener('click', closeModal);

  // Hover effects
  banUserBtn.addEventListener('mouseenter', () => {
    if (!banUserBtn.disabled) {
      banUserBtn.style.background = '#b71c1c';
    }
  });

  banUserBtn.addEventListener('mouseleave', () => {
    if (!banUserBtn.disabled) {
      banUserBtn.style.background = '#d32f2f';
    }
  });

  dismissUserBtn.addEventListener('mouseenter', () => {
    if (!dismissUserBtn.disabled) {
      dismissUserBtn.style.background = '#f57c00';
    }
  });
  dismissUserBtn.addEventListener('mouseleave', () => {
    if (!dismissUserBtn.disabled) {
      dismissUserBtn.style.background = '#ff9800';
    }
  });

  closeBtn.addEventListener('mouseenter', () => {
    closeBtn.style.background = '#e0e0e0';
  });

  closeBtn.addEventListener('mouseleave', () => {
    closeBtn.style.background = '#f5f5f5';
  });

  // Focus on textarea
  setTimeout(() => {
    banReasonTextarea.focus();
  }, 100);
}

// --- Dismiss Report Operation ---
async function performDissmissReport(reportId, reason) {
  if (!validateUserId(reportId)) {
    throw new AppError('Invalid report ID', 'VALIDATION_ERROR');
  }
  const sanitizedReason = sanitizeInput(reason);
  if (!sanitizedReason) {
    throw new AppError('Dismiss reason is required', 'VALIDATION_ERROR');
  }
  try {
    const adminId = (auth.currentUser && auth.currentUser.uid) || null;
    const result = await retryOperation(async () => {
      //console.log('Dismissing report with ID:', reportId, 'by admin:', adminId);
      return await dissmissReport(reportId, sanitizedReason, adminId);
    });
    if (!result || !result.success) {
      throw new AppError('Dismiss operation failed', 'DISMISS_FAILED');
    }
    Logger.info('Report dismissed successfully:', { reportId });
    return result;
  } catch (error) {
    Logger.error('Dismiss report error:', { reportId, error });
    throw new AppError('Failed to dismiss report', 'DISMISS_FAILED', error);
  }
}

// --- Reports Rendering ---
async function renderReports(type) {
  const container = document.getElementById("reportedUsersList");
  if (!container) {
    Logger.error('Reports container not found');
    return;
  }

  showLoadingSpinner(container, `Loading ${type} reports...`);

  try {
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new AppError('Request timed out', 'TIMEOUT')), CONFIG.LOADING_TIMEOUT)
    );

    const reportPromise = type === "unresolved" 
      ? getUnresolvedReports() 
      : getResolvedReports();

    const snapshot = await Promise.race([reportPromise, timeout]);

    if (!snapshot || snapshot.empty) {
      container.innerHTML = `
        <div style="padding:3rem;text-align:center;color:#666;">
          <div style="font-size:1.2rem;margin-bottom:0.5rem;">No ${type} reports found</div>
          <div style="font-size:0.9rem;">All clear! 🎉</div>
        </div>
      `;
      return;
    }

    container.innerHTML = "";
    
    const reports = [];
    snapshot.forEach((docSnap) => {
      reports.push({ id: docSnap.id, ...docSnap.data() });
    });

    // Sort reports by date (newest first)
    reports.sort((a, b) => {
      const timeA = a.timestamp?.toDate?.() || new Date(a.timestamp || 0);
      const timeB = b.timestamp?.toDate?.() || new Date(b.timestamp || 0);
      return timeB - timeA;
    });

    reports.forEach((data) => {
      const reportID = data.id;
      const reportedUid = data.reportedUid || 'Unknown User';
      const reporterUid = data.reporterUid || "Unknown Reporter";
      const report = data.reason || data.report || 'No reason provided';
      const dateStr = formatDate(data.timestamp);

      const item = document.createElement('div');
      item.className = 'content-item';
      item.style.cssText = `
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 1rem;
        transition: box-shadow 0.2s ease, transform 0.2s ease;
      `;

      item.addEventListener('mouseenter', () => {
        item.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        item.style.transform = 'translateY(-2px)';
      });

      item.addEventListener('mouseleave', () => {
        item.style.boxShadow = 'none';
        item.style.transform = 'translateY(0)';
      });

      let resolvedDetails = '';
      if (type === 'resolved') {
        resolvedDetails = `
          <div style="margin-top:0.5rem;font-size:1rem;"><strong>Outcome:</strong> ${sanitizeInput(data.outcome || 'N/A')}</div>
          <div style="margin-top:0.5rem;font-size:1rem;"><strong>Outcome Reason:</strong> ${sanitizeInput(data.outcomeReason || 'N/A')}</div>
          <div style="margin-top:0.5rem;font-size:1rem;"><strong>Resolved By:</strong> ${sanitizeInput(data.resolvedBy || 'N/A')}</div>
          <div style="margin-top:0.5rem;font-size:1rem;"><strong>Resolved At:</strong> ${formatDate(data.resolvedAt)}</div>
        `;
      }

      item.innerHTML =
        '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:1.5rem;">' +
          '<div style="flex:1;min-width:0;">' +
            '<div style="display:flex;flex-wrap:wrap;gap:1rem;margin-bottom:0.75rem;">' +
              '<div>' +
                '<span style="font-weight:500;color:#333;">User:</span>' +
                '<span style="color:#666;word-break:break-all;margin-left:0.5rem;">' + sanitizeInput(reportedUid) + '</span>' +
              '</div>' +
              '<div>' +
                '<span style="font-weight:500;color:#333;">Reported By:</span>' +
                '<span style="color:#666;margin-left:0.5rem;">' + sanitizeInput(reporterUid) + '</span>' +
              '</div>' +
              '<div>' +
                '<span style="font-weight:500;color:#333;">Date:</span>' +
                '<span style="color:#666;margin-left:0.5rem;">' + dateStr + '</span>' +
              '</div>' +
            '</div>' +
            '<div>' +
              '<div style="font-weight:500;color:#333;margin-bottom:0.5rem;">Report:</div>' +
              '<div style="color:#666;line-height:1.4;background:#f8f9fa;padding:0.75rem;border-radius:6px;word-break:break-word;">' + sanitizeInput(report) + '</div>' +
            '</div>' +
            resolvedDetails +
          '</div>' +
          (type === 'unresolved'
            ? '<button class="manage-user-btn" style="background:#2196f3;color:#fff;border:none;padding:0.75rem 1.5rem;border-radius:8px;font-size:0.9rem;cursor:pointer;white-space:nowrap;transition:background 0.2s;align-self:flex-start;">Manage User</button>'
            : '') +
        '</div>';

      if (type === 'unresolved') {
        const manageBtn = item.querySelector('.manage-user-btn');
        
        manageBtn.addEventListener('mouseenter', () => {
          manageBtn.style.background = '#1976d2';
        });

        manageBtn.addEventListener('mouseleave', () => {
          manageBtn.style.background = '#2196f3';
        });

        manageBtn.addEventListener('click', () => {
          createUserModal(
            { userid: reportedUid, dateStr, report, reportID },
            async (reason) => {
              try {
                await performBanUser(reportedUid, reporterUid, reportID, report, reason, dateStr);
                await renderReports('unresolved');
                await getAdminCounts();
                updateCountsDisplay();
              } catch (error) {
                throw error; // Re-throw to be handled by modal
              }
            }
          );
        });
      }

      container.appendChild(item);
    });

    Logger.info(`Loaded ${reports.length} ${type} reports`);

  } catch (error) {
    Logger.error(`Error loading ${type} reports:`, error);
    container.innerHTML = `
      <div style="padding:3rem;text-align:center;">
        <div style="color:#d32f2f;font-size:1.2rem;margin-bottom:1rem;">⚠️ Error Loading Reports</div>
        <div style="color:#666;margin-bottom:2rem;">${getUserFriendlyErrorMessage(error)}</div>
        <button id="retryBtn" style="
          background:#2196f3;
          color:#fff;
          border:none;
          padding:0.75rem 2rem;
          border-radius:8px;
          font-size:1rem;
          cursor:pointer;
          transition:background 0.2s;
        ">
          Try Again
        </button>
      </div>
    `;

    const retryBtn = container.querySelector('#retryBtn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => renderReports(type));
      retryBtn.addEventListener('mouseenter', () => {
        retryBtn.style.background = '#1976d2';
      });
      retryBtn.addEventListener('mouseleave', () => {
        retryBtn.style.background = '#2196f3';
      });
    }
  }
}

// --- Count Updates ---
function updateCountsDisplay() {
  const counts = appState.counts;
  const activeCount = document.getElementById("activeUsersCount");
  const reportedCount = document.getElementById("reportedUsersCount");
  const bannedCount = document.getElementById("bannedUsersCount");

  if (activeCount) {
    activeCount.textContent = counts.active.toLocaleString();
    activeCount.setAttribute('aria-label', `${counts.active} active users`);
  }
  if (reportedCount) {
    reportedCount.textContent = counts.reported.toLocaleString();
    reportedCount.setAttribute('aria-label', `${counts.reported} reported users`);
  }
  if (bannedCount) {
    bannedCount.textContent = counts.banned.toLocaleString();
    bannedCount.setAttribute('aria-label', `${counts.banned} banned users`);
  }
}

// --- Initialization ---
async function initializeDashboard(user) {
  try {
    Logger.info('Initializing admin dashboard for user:', user.uid);

    // Set up toggle container
    const toggleContainer = document.getElementById("toggleContainer");
    if (toggleContainer) {
      toggleContainer.innerHTML = '';
      toggleContainer.appendChild(createToggleContainer());
    }

    // Load initial data
    showLoadingSpinner(document.getElementById("reportedUsersList"), "Loading dashboard...");
    
    const [counts] = await Promise.allSettled([
      getAdminCounts()
    ]);

    if (counts.status === 'fulfilled') {
      updateCountsDisplay();
    } else {
      Logger.error('Failed to load counts:', counts.reason);
      showNotification('Failed to load some dashboard data', 'warning');
    }

    // Load initial reports
    await renderReports("unresolved");

    // Set up banned users modal trigger
    setupBannedUsersModal();

    Logger.info('Dashboard initialized successfully');

  } catch (error) {
    Logger.error('Dashboard initialization error:', error);
    handleError(error, 'Dashboard Initialization');
    
    // Show fallback UI
    const container = document.getElementById("reportedUsersList");
    if (container) {
      container.innerHTML = `
        <div style="padding:3rem;text-align:center;">
          <div style="color:#d32f2f;font-size:1.5rem;margin-bottom:1rem;">⚠️ Dashboard Error</div>
          <div style="color:#666;margin-bottom:2rem;">Failed to initialize the admin dashboard. Please refresh the page or contact support.</div>
          <button onclick="location.reload()" style="
            background:#2196f3;
            color:#fff;
            border:none;
            padding:1rem 2rem;
            border-radius:8px;
            font-size:1.1rem;
            cursor:pointer;
          ">
            Refresh Page
          </button>
        </div>
      `;
    }
  }
}

function setupBannedUsersModal() {
  const bannedCount = document.getElementById("bannedUsersCount");
  const bannedCard = bannedCount?.closest('.stat-card, [data-stat="banned"]') || bannedCount?.parentElement;
  
  if (bannedCard) {
    bannedCard.style.cursor = "pointer";
    bannedCard.style.transition = "transform 0.2s ease, box-shadow 0.2s ease";
    bannedCard.title = "Click to view all banned accounts";
    bannedCard.setAttribute('role', 'button');
    bannedCard.setAttribute('tabindex', '0');
    bannedCard.setAttribute('aria-label', 'View banned accounts');

    const handleClick = async () => {
      try {
        showLoadingSpinner({ innerHTML: '' }, 'Loading banned users...');
        
        const snapshot = await retryOperation(() => getBannedUsers());
        const users = snapshot?.docs ? snapshot.docs.map((doc) => ({ 
          id: doc.id, 
          ...doc.data() 
        })) : [];
        
        showBannedUsersModal(users);
      } catch (error) {
        handleError(error, 'Load Banned Users');
      }
    };

    // Mouse events
    bannedCard.addEventListener("click", handleClick);
    
    bannedCard.addEventListener('mouseenter', () => {
      bannedCard.style.transform = 'translateY(-2px)';
      bannedCard.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    });

    bannedCard.addEventListener('mouseleave', () => {
      bannedCard.style.transform = 'translateY(0)';
      bannedCard.style.boxShadow = 'none';
    });

    // Keyboard events
    bannedCard.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    });

    bannedCard.addEventListener('focus', () => {
      bannedCard.style.outline = '2px solid #2196f3';
      bannedCard.style.outlineOffset = '2px';
    });

    bannedCard.addEventListener('blur', () => {
      bannedCard.style.outline = 'none';
      bannedCard.style.outlineOffset = 'initial';
    });
  }
}

// --- Event Listeners ---
document.addEventListener("DOMContentLoaded", () => {
  Logger.info('DOM loaded, setting up admin dashboard');

  // Set up authentication listener
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      Logger.warn('No authenticated user, redirecting to login');
      window.location.href = "login.html";
      return;
    }

    try {
      // Verify admin permissions here if needed
      // const isAdmin = await checkAdminPermissions(user);
      // if (!isAdmin) {
      //   Logger.warn('User lacks admin permissions');
      //   showNotification('Access denied: Admin permissions required', 'error');
      //   window.location.href = "index.html";
      //   return;
      // }

      await initializeDashboard(user);
    } catch (error) {
      Logger.error('Authentication handler error:', error);
      handleError(error, 'Authentication');
    }
  });

  // Global error handler
  window.addEventListener('error', (event) => {
    Logger.error('Global error:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    });
  });

  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    Logger.error('Unhandled promise rejection:', event.reason);
    event.preventDefault(); // Prevent default browser behavior
  });

  // Visibility change handler (refresh data when tab becomes visible)
  document.addEventListener('visibilitychange', debounce(async () => {
    if (!document.hidden && auth.currentUser) {
      try {
        Logger.info('Tab became visible, refreshing data');
        await getAdminCounts();
        updateCountsDisplay();
        await renderReports(appState.currentView);
      } catch (error) {
        Logger.warn('Failed to refresh data on visibility change:', error);
      }
    }
  }, 1000));
});

// --- Cleanup ---
window.addEventListener('beforeunload', () => {
  // Clean up any listeners or ongoing operations
  appState.listeners.clear();
  Logger.info('Page unloading, cleanup completed');
});

// --- Export for testing (if needed) ---
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AppError,
    Logger,
    formatDate,
    sanitizeInput,
    validateUserId,
    validateEmail,
    performBanUser,
    performUnbanUser,
    AdminDashboardState
  };
}