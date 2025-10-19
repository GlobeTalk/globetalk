// tests/frontend/unit/utils_login.test.js
jest.mock('../../../src/services/firebase.js', () => ({
  signInWithGoogle: jest.fn(),
  observeUser: jest.fn(),
}));
import { utils } from '../../../src/frontend/scripts/login.js';

describe('utils (login.js)', () => {
  beforeEach(() => localStorage.clear());

  test('setSecureToken and getSecureToken should store and retrieve a valid token', () => {
    const token = 'abc123';
    utils.setSecureToken(token, 1); // 1 hour
    const result = utils.getSecureToken();
    expect(result).toBe(token);
  });

  test('getSecureToken should return null if expired', () => {
    const expiredToken = { token: 'old', expiration: Date.now() - 1000 };
    localStorage.setItem('idToken', JSON.stringify(expiredToken));
    expect(utils.getSecureToken()).toBeNull();
  });

  test('sanitizeUserId should trim valid IDs', () => {
    expect(utils.sanitizeUserId('  user123  ')).toBe('user123');
  });

  test('sanitizeUserId should throw for invalid input', () => {
    expect(() => utils.sanitizeUserId(null)).toThrow('Invalid user ID');
  });

  test('retryOperation retries until success', async () => {
    let attempts = 0;
    const mockFn = jest.fn(() => {
      attempts++;
      if (attempts < 2) throw new Error('fail');
      return 'success';
    });
    const result = await utils.retryOperation(mockFn);
    expect(result).toBe('success');
    expect(attempts).toBe(2);
  });

  test('debounce delays function execution', () => {
    jest.useFakeTimers();
    const mockFn = jest.fn();
    const debounced = utils.debounce(mockFn, 200);

    debounced();
    jest.advanceTimersByTime(100);
    expect(mockFn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(200);
    expect(mockFn).toHaveBeenCalled();
  });
});
