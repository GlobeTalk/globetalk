/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { fireEvent, screen } from "@testing-library/dom";

// Mock Firebase auth methods
jest.mock("https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js", () => {
  return {
    GoogleAuthProvider: jest.fn().mockImplementation(() => ({
      addScope: jest.fn()
    })),
    signInWithPopup: jest.fn(() => Promise.resolve({ user: { uid: "123", email: "test@example.com" } })),
    getAuth: jest.fn(() => ({})),
    signOut: jest.fn(() => Promise.resolve()),
    onAuthStateChanged: jest.fn((auth, cb) => cb(null)) // simulate signed-out state
  };
});

// Import the script AFTER mocks
import "./src/frontend/scripts/login.js";

describe("Login Page", () => {
  beforeEach(() => {
    // Set up DOM
    document.body.innerHTML = `
      <button id="loginBtn">Sign in with Google</button>
      <div id="statusMessage" class="status"></div>
    `;
  });

  test("shows success message after successful login", async () => {
    const loginBtn = screen.getByText(/Sign in with Google/i);

    // Click button
    await userEvent.click(loginBtn);

    // Wait for message
    const message = await screen.findByText(/Login successful/i);
    expect(message).toBeInTheDocument();
    expect(message).toHaveClass("success");
  });

  test("handles popup closed error", async () => {
    // Override mock for this test
    const { signInWithPopup } = await import("https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js");
    signInWithPopup.mockRejectedValueOnce({ code: "auth/popup-closed-by-user" });

    const loginBtn = screen.getByText(/Sign in with Google/i);
    await userEvent.click(loginBtn);

    const message = await screen.findByText(/popup was closed/i);
    expect(message).toBeInTheDocument();
    expect(message).toHaveClass("error");
  });
});
