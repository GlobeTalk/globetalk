// tests/frontend/unit/index.test.js

// 🧩 Mock the module BEFORE importing it
jest.mock('../../../src/frontend/scripts/index.js', () => {
  const original = jest.requireActual('../../../src/frontend/scripts/index.js');
  return {
    ...original,
    redirectToLogin: jest.fn(), // mock this before import
  };
});

import * as IndexModule from '../../../src/frontend/scripts/index.js';
const { redirectToLogin, goToLogin, setupGetStartedBtn } = IndexModule;

describe('redirectToLogin', () => {
  it('sets window.location.href correctly', () => {
    const mockWindow = { location: { href: '' } };
    // Call the *real* implementation manually for coverage
    jest.isolateModules(() => {
      const realModule = jest.requireActual('../../../src/frontend/scripts/index.js');
      realModule.redirectToLogin(mockWindow);
      expect(mockWindow.location.href).toBe('../../../pages/login.html');
    });
  });
});

describe('goToLogin', () => {
  it('calls navigate with correct URL', () => {
    const navigateMock = jest.fn();
    goToLogin(navigateMock);
    expect(navigateMock).toHaveBeenCalledWith('../../../pages/login.html');
  });
});

describe('getStartedBtn click and keydown', () => {
  let joinButton;
  let clickMock;

  beforeEach(() => {
    document.body.innerHTML = `<button id="getStartedBtn">Get Started</button>`;
    joinButton = document.getElementById('getStartedBtn');
    clickMock = jest.fn();
    setupGetStartedBtn(); 
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /*it('click calls redirectToLogin', () => {
    joinButton.click();
    expect(redirectToLogin).toHaveBeenCalled();
  });*/

  it('keydown Enter triggers click', () => {
    joinButton.click = clickMock;
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    joinButton.dispatchEvent(event);
    expect(clickMock).toHaveBeenCalled();
  });

  it('keydown Space triggers click and prevents default', () => {
    joinButton.click = clickMock;
    const preventDefaultMock = jest.fn();
    const event = new KeyboardEvent('keydown', { key: ' ' });
    Object.defineProperty(event, 'preventDefault', { value: preventDefaultMock });
    joinButton.dispatchEvent(event);
    expect(clickMock).toHaveBeenCalled();
    expect(preventDefaultMock).toHaveBeenCalled();
  });

  it('keydown other key does not trigger click', () => {
    joinButton.click = clickMock;
    const event = new KeyboardEvent('keydown', { key: 'a' });
    joinButton.dispatchEvent(event);
    expect(clickMock).not.toHaveBeenCalled();
  });
});
