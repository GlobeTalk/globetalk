// tests/frontend/login.test.js
import { login } from "../../src/frontend/scripts/login.js";

// Mock Firebase
jest.mock("firebase/app-compat", () => {
  return {
    initializeApp: jest.fn(() => ({}))
  };
});
jest.mock("firebase/auth-compat", () => {
  return {
    getAuth: jest.fn(() => ({})),
    signInWithPopup: jest.fn(() => ({ user: { displayName: "Test User" } })),
    GoogleAuthProvider: jest.fn()
  };
});

describe("Login Page", () => {
  test("login returns a user object", async () => {
    const user = await login();
    expect(user).toBeDefined();
    expect(user.displayName).toBe("Test User");
  });
});
