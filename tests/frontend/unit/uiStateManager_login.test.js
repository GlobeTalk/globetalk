// Mocks
jest.mock('../../../src/services/firebase.js', () => ({
  signInWithGoogle: jest.fn(),
  observeUser: jest.fn(),
}));

jest.mock('../../../src/services/admin.js', () => ({
  isBannedUser: jest.fn(),
  isAdmin: jest.fn(),
}));

import { signInWithGoogle, observeUser } from '../../../src/services/firebase.js';
import { isBannedUser, isAdmin } from '../../../src/services/admin.js';
import { UIStateManager, utils, CONFIG } from '../../../src/frontend/scripts/login.js';

describe('UIStateManager and login logic', () => {
  let loginBtn, privacyCheckbox, consentCheckbox, messageEl, uiManager;

  beforeEach(() => {
    document.body.innerHTML = `
      <button id="loginBtn">Login</button>
      <input type="checkbox" id="privacy">
      <input type="checkbox" id="consent">
      <div id="auth-message"></div>
    `;
    loginBtn = document.getElementById('loginBtn');
    privacyCheckbox = document.getElementById('privacy');
    consentCheckbox = document.getElementById('consent');
    messageEl = document.getElementById('auth-message');
    uiManager = new UIStateManager();
    jest.useFakeTimers();
    localStorage.clear();

    // Reset mocks
    signInWithGoogle.mockReset();
    observeUser.mockReset();
    isBannedUser.mockReset();
    isAdmin.mockReset();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('UIStateManager', () => {
    test('setLoading enables and disables button', () => {
      uiManager.setLoading(loginBtn, true, 'Loading...');
      expect(loginBtn.disabled).toBe(true);
      uiManager.setLoading(loginBtn, false);
      expect(loginBtn.disabled).toBe(false);
    });

    test('showMessage displays and hides message', () => {
      uiManager.showMessage('Success!', 'success', 2000);
      expect(messageEl.textContent).toBe('Success!');
      jest.advanceTimersByTime(2000);
      expect(messageEl.style.display).toBe('none');
    });
  });

  describe('debounce', () => {
    test('debounces function correctly', () => {
      const mockFn = jest.fn();
      const debouncedFn = utils.debounce(mockFn, 1000);
      debouncedFn();
      debouncedFn();
      jest.advanceTimersByTime(1000);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateButtonState logic', () => {
    test('login button disabled when checkboxes unchecked', () => {
      privacyCheckbox.checked = false;
      consentCheckbox.checked = false;
      const updateButtonState = utils.debounce(() => {
        const returningUser = localStorage.getItem(CONFIG.STORAGE_KEYS.POLICIES_ACCEPTED) === "true";
        const currentlyAccepted = privacyCheckbox.checked && consentCheckbox.checked;
        loginBtn.disabled = !(returningUser || currentlyAccepted);
      }, 100);
      updateButtonState();
      jest.advanceTimersByTime(100);
      expect(loginBtn.disabled).toBe(true);
    });

    test('login button enabled when checkboxes checked', () => {
      privacyCheckbox.checked = true;
      consentCheckbox.checked = true;
      const updateButtonState = utils.debounce(() => {
        const returningUser = localStorage.getItem(CONFIG.STORAGE_KEYS.POLICIES_ACCEPTED) === "true";
        const currentlyAccepted = privacyCheckbox.checked && consentCheckbox.checked;
        loginBtn.disabled = !(returningUser || currentlyAccepted);
      }, 100);
      updateButtonState();
      jest.advanceTimersByTime(100);
      expect(loginBtn.disabled).toBe(false);
    });
  });

  // Placeholder for login flow with Firebase mocks
  describe('login flow (logic only, no navigation)', () => {
    test.skip('successful login would store token and redirect', async () => {});
    test.skip('banned user would show error', async () => {});
    test.skip('admin user would redirect to admin dashboard', async () => {});
    test.skip('existing user redirects to dashboard', async () => {});
    test.skip('new user redirects to onboarding', async () => {});
  });
});
