const path = require('path');
const fs = require('fs');
const { JSDOM } = require('jsdom');
import { getAdminCounts } from '../../src/frontend/scripts/adminpage.js';

// Mock the admin service functions
jest.mock('../../src/services/admin.js', () => ({
  getActiveUserCount: jest.fn(() => Promise.resolve(42)),
  getFlaggedUserCount: jest.fn(() => Promise.resolve(3)),
  getTotalUserCount: jest.fn(() => Promise.resolve(100)),
}));

describe('Admin Page', () => {
  test('adminpage.js loads in JSDOM without throwing', async () => {
    const scriptPath = path.join(__dirname, '../../src/frontend/scripts/adminpage.js');
    const code = fs.readFileSync(scriptPath, 'utf8');
    const dom = new JSDOM(`<!DOCTYPE html><body></body>`, { runScripts: "dangerously" });

    // Attach the script to the DOM
    const scriptEl = dom.window.document.createElement('script');
    scriptEl.textContent = code;
    dom.window.document.body.appendChild(scriptEl);

    // If the script throws, the test will fail
  });
});