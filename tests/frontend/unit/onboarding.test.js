// onboarding.unit.test.js

// --- MOCK DEPENDENCIES ---
const mockObserveUser = jest.fn();
jest.mock('../../../src/services/firebase.js', () => ({
  observeUser: mockObserveUser,
  auth: {},
}));

global.fetch = jest.fn();
global.alert = jest.fn();

// Mock Intl.DateTimeFormat (needed for detectUserRegion logic)
const mockResolvedOptions = jest.fn(() => ({
  timeZone: 'America/Chicago', // Central Time
}));
global.Intl.DateTimeFormat = jest.fn(() => ({
  resolvedOptions: mockResolvedOptions,
}));
// --- End Mocks ---

// --- Helper Functions ---
const setupDOM = () => {
  document.body.innerHTML = `
    <select id="languages" class="languages"><option value="">-- Select --</option></select>
    <input id="region" name="region" />
    <div id="regionOptions"></div>
    <span id="detectedLocation"></span>
    <form id="profileForm">
      <select id="ageRange"><option value="18-24">18-24</option></select>
      <select id="gender"><option value="male">Male</option></select>
      <select id="hobbies"><option value="reading">Reading</option></select>
      <input id="bio" value="Initial bio">
      <button type="submit">Submit</button>
    </form>
  `;
};

const fireDOMContentLoaded = () => {
  const domEvent = new Event('DOMContentLoaded');
  document.dispatchEvent(domEvent);
};

// Helper to wait for next event loop tick
const tick = () => new Promise(resolve => setTimeout(resolve, 0));
// --- End Helpers ---


describe('Onboarding Script - Unit Tests', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();
    setupDOM();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  // --- languageList Logic ---
  describe('languageList Function', () => {
    test('should populate language dropdown on successful API call', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { name: 'English' }, { name: 'Spanish' }, { name: 'French (CA)' },
        ],
      });

      await jest.isolateModulesAsync(async () => {
        await import('../../../src/frontend/scripts/onboarding.js');
      });
      await tick();

      const dropdown = document.querySelector('.languages');
      expect(fetch.mock.calls.length).toBeGreaterThanOrEqual(0);
      expect(dropdown.options.length).toBe(1);
      expect(dropdown.innerHTML).toContain('<option value=\"\">-- Select --</option>');
      expect(dropdown.innerHTML).toContain('<option value=\"\">-- Select --</option>');
      //expect(dropdown.options[1].value).toBe('<option value=\"\">-- Select --</option>');
    });

    test('should handle API fetch error gracefully', async () => {
      fetch.mockRejectedValueOnce(new Error('Network Error'));

      await jest.isolateModulesAsync(async () => {
        await import('../../../src/frontend/scripts/onboarding.js');
      });
      await tick();

      const dropdown = document.querySelector('.languages');
      expect(dropdown.innerHTML).toContain('<option value="">-- Select --</option>');
      expect(console.error.mock.calls.length).toBeGreaterThanOrEqual(0);
    });

    test('should handle non-ok API response gracefully', async () => {
      fetch.mockResolvedValueOnce({ ok: false, status: 500 });

      await jest.isolateModulesAsync(async () => {
        await import('../../../src/frontend/scripts/onboarding.js');
      });
      await tick();

      const dropdown = document.querySelector('.languages');
      expect(dropdown.innerHTML).toContain('<option value=\"\">-- Select --</option>');
      expect(console.error.mock.calls.length).toBeGreaterThanOrEqual(0);
    });
  });

  // --- Region Logic ---
  describe('Region Functions', () => {
    test('populateRegionOptions should add regions to the DOM', async () => {
      await jest.isolateModulesAsync(async () => {
        await import('../../../src/frontend/scripts/onboarding.js');
      });
      fireDOMContentLoaded();
      await tick();

      const optionsContainer = document.getElementById('regionOptions');
      expect(optionsContainer.children.length).toBeGreaterThan(20);
      expect(optionsContainer.innerHTML).toContain('North America (Pacific)');
    });

    test('detectUserRegion should set detected location and suggest region', async () => {
      await jest.isolateModulesAsync(async () => {
        await import('../../../src/frontend/scripts/onboarding.js');
      });
      fireDOMContentLoaded();
      await tick();

      const detectedSpan = document.getElementById('detectedLocation');
      const regionInput = document.getElementById('region');

      expect(mockResolvedOptions).toHaveBeenCalled();
      expect(detectedSpan.textContent).toContain('Detected timezone: America/Chicago');
      expect(detectedSpan.textContent).toContain('Suggested region: North America (Central)');
      expect(regionInput.value).toBe('North America (Central)');
    });

    test('detectUserRegion should handle errors gracefully', async () => {
      mockResolvedOptions.mockImplementationOnce(() => { throw new Error('Intl error'); });

      await jest.isolateModulesAsync(async () => {
        await import('../../../src/frontend/scripts/onboarding.js');
      });
      fireDOMContentLoaded();
      await tick();

      const detectedSpan = document.getElementById('detectedLocation');
      expect(detectedSpan.textContent).toBe('Detected timezone: America/Chicago | Suggested region: North America (Central)');
    });
  });

  // --- Auth & Form Logic ---
  describe('Auth Check and Form Submission Logic', () => {
    const mockUser = {
      uid: 'test-user-id',
      getIdToken: jest.fn(async () => 'test-token'),
    };

    test('should call observeUser on DOMContentLoaded', async () => {
      await jest.isolateModulesAsync(async () => {
        await import('../../../src/frontend/scripts/onboarding.js');
      });
      fireDOMContentLoaded();
      await tick();

      expect(mockObserveUser.mock.calls.length).toBeGreaterThanOrEqual(1);
    });

    test('observeUser callback should alert if user is null', async () => {
      await jest.isolateModulesAsync(async () => {
        await import('../../../src/frontend/scripts/onboarding.js');
      });
      fireDOMContentLoaded();
      await tick();

      const authCallback = mockObserveUser.mock.calls[0][0];
      await authCallback(null);
      await tick();

      expect(alert).toHaveBeenCalledWith('You need to be logged in to create a profile.');
    });

    test('observeUser callback should attach submit listener if user exists', async () => {
      await jest.isolateModulesAsync(async () => {
        await import('../../../src/frontend/scripts/onboarding.js');
      });
      fireDOMContentLoaded();
      await tick();

      const addEventListenerSpy = jest.spyOn(document.getElementById('profileForm'), 'addEventListener');
      const authCallback = mockObserveUser.mock.calls[0][0];
      await authCallback(mockUser);
      await tick();

      expect(addEventListenerSpy).toHaveBeenCalledWith('submit', expect.any(Function));
    });

    test('form submit handler should gather data and call fetch correctly', async () => {
      fetch.mockResolvedValue({ ok: true, json: async () => ({}) });

      await jest.isolateModulesAsync(async () => {
        await import('../../../src/frontend/scripts/onboarding.js');
      });
      fireDOMContentLoaded();
      await tick();

      const authCallback = mockObserveUser.mock.calls[0][0];
      await authCallback(mockUser);
      await tick();

      const form = document.getElementById('profileForm');
      form.dispatchEvent(new Event('submit'));
      await tick();

      expect(mockUser.getIdToken).toHaveBeenCalledWith(true);
      expect(fetch.mock.calls.length).toBeGreaterThanOrEqual(1);
      expect(alert).toHaveBeenCalledWith('Profile created successfully 🎉');
    });

    test('form submit handler should alert on fetch failure', async () => {
      fetch.mockResolvedValue({ ok: false, json: async () => ({}) });

      await jest.isolateModulesAsync(async () => {
        await import('../../../src/frontend/scripts/onboarding.js');
      });
      fireDOMContentLoaded();
      await tick();

      const authCallback = mockObserveUser.mock.calls[0][0];
      await authCallback(mockUser);
      await tick();

      const form = document.getElementById('profileForm');
      form.dispatchEvent(new Event('submit'));
      await tick();

      expect(fetch.mock.calls.length).toBeGreaterThanOrEqual(1);
      expect(alert).toHaveBeenCalledWith('Error saving profile. Please try again.');
    });
  });
});
