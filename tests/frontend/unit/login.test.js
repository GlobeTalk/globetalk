/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { fireEvent, getByRole, getByLabelText } from "@testing-library/dom";

// Mock Firebase module
// Mock Firebase module
jest.mock("../../src/services/firebase.js", () => {
  class MockGoogleProvider {}   // <- class for constructor
  return {
    getAuth: jest.fn(() => ({})), // dummy auth object
    GoogleAuthProvider: MockGoogleProvider,
    signInWithPopup: jest.fn().mockResolvedValue({
      user: { uid: "123", email: "test@example.com" },
    }),
  };
});

// Import the real login module
import { initLogin } from "../../../src/frontend/scripts/login.js";
import { signInWithPopup, GoogleAuthProvider } from "../../../src/services/firebase.js";

describe("Login page Firebase login tests", () => {
  let container;

  beforeEach(() => {
    // Set up DOM
    document.body.innerHTML = `
      <main class="login-wrapper">
        <section class="section-card login-left">
          <div class="consent-boxes">
            <label>
              <input type="checkbox" id="privacy">
              I accept the Privacy Policy
            </label>
            <label>
              <input type="checkbox" id="consent">
              I consent to data processing as described in the Terms
            </label>
          </div>
        </section>
        <section class="section-card login-right">
          <div id="statusMessage" class="status"></div>
          <button id="loginBtn">Continue with Google</button>
        </section>
      </main>
    `;
    container = document.body;

    // Initialize login (attaches event listeners)
    initLogin();
  });

  test("clicking login with only one checkbox checked highlights the unchecked box", () => {
  const loginBtn = getByRole(container, "button", { name: /continue with google/i });
  const privacy = getByLabelText(container, /privacy policy/i);
  const consent = getByLabelText(container, /consent/i);

  // Spy on alert
  const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});

  // Check only the privacy box
  fireEvent.click(privacy);

  fireEvent.click(loginBtn);

  // Alert should appear
  expect(alertMock).toHaveBeenCalledWith(expect.stringMatching(/accept/i));

  // Outline: checked box not red, unchecked box red
  expect(privacy.parentElement).not.toHaveStyle("outline: 2px solid red");
  expect(consent.parentElement).toHaveStyle("outline: 2px solid red");

  alertMock.mockRestore();
});


  test("clicking login with both boxes checked registers user in Firebase", async () => {
    const loginBtn = getByRole(container, "button", { name: /continue with google/i });
    const privacy = getByLabelText(container, /privacy policy/i);
    const consent = getByLabelText(container, /consent/i);
    const statusDiv = container.querySelector("#statusMessage");

    // Check boxes
    fireEvent.click(privacy);
    fireEvent.click(consent);

    // Click login
    await fireEvent.click(loginBtn);

    // signInWithPopup should be called
    expect(signInWithPopup).toHaveBeenCalledWith(expect.any(Object), expect.any(GoogleAuthProvider));

    // Status message updated
    expect(statusDiv).toHaveTextContent(/logged in as test@example.com/i);
  });
});
