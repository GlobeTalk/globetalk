// tests/frontend/unit/userCheck_login.test.js
jest.mock('../../../src/services/firebase.js', () => ({
  signInWithGoogle: jest.fn(),
  observeUser: jest.fn(),
}));

import { checkIfUserExists, utils, AuthError, NetworkError } from '../../../src/frontend/scripts/login.js';

// Mock fetch globally
global.fetch = jest.fn();

describe('checkIfUserExists', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('returns true if user exists', async () => {
    localStorage.setItem('idToken', JSON.stringify({ token: 'abc123', expiration: Date.now() + 1000 }));
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ exists: true }),
    });

    const result = await checkIfUserExists('user123');
    expect(result).toBe(true);
    expect(fetch).toHaveBeenCalled();
  });

  test('returns false if user does not exist', async () => {
    localStorage.setItem('idToken', JSON.stringify({ token: 'abc123', expiration: Date.now() + 1000 }));
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ exists: false }),
    });

    const result = await checkIfUserExists('user123');
    expect(result).toBe(false);
    expect(fetch).toHaveBeenCalled();
  });

  test('throws AuthError if token is missing', async () => {
    await expect(checkIfUserExists('user123')).rejects.toThrow(AuthError);
  });

  test('throws AuthError if userId is invalid', async () => {
    localStorage.setItem('idToken', JSON.stringify({ token: 'abc123', expiration: Date.now() + 1000 }));
    await expect(checkIfUserExists(null)).rejects.toThrow(AuthError);
  });

  test('throws NetworkError on fetch failure', async () => {
    // Mock getSecureToken to return a valid token
    jest.spyOn(utils, 'getSecureToken').mockReturnValue('valid-token');

    // Mock sanitizeUserId to return a valid ID
    jest.spyOn(utils, 'sanitizeUserId').mockReturnValue('user123');

    // Mock retryOperation to run immediately
    jest.spyOn(utils, 'retryOperation').mockImplementation(async (fn) => fn());

    // Simulate network/server failure
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Server error' }),
    });

    await expect(checkIfUserExists('user123')).rejects.toThrow(NetworkError);
    expect(fetch).toHaveBeenCalledTimes(1);

    // Restore spies after test
    utils.getSecureToken.mockRestore();
    utils.sanitizeUserId.mockRestore();
    utils.retryOperation.mockRestore();
  });

  test('throws AuthError if server returns invalid format', async () => {
    localStorage.setItem('idToken', JSON.stringify({ token: 'abc123', expiration: Date.now() + 1000 }));
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ wrongKey: true }),
    });

    await expect(checkIfUserExists('user123')).rejects.toThrow(AuthError);
  });
});
