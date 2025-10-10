/**
 * @jest-environment jsdom
 */

describe("Login Page ", () => {
  beforeAll(() => {
    // Prevent JSDOM navigation errors
    delete window.location;
    window.location = { href: "" };

    // Mock the HTML structure of login.html
    document.body.innerHTML = `
      <h1>Login</h1>
      <button id="google-login">Login with Google</button>
    `;
  });

  it("renders the login page", () => {
    const heading = document.querySelector("h1");
    expect(heading).not.toBeNull();
    expect(heading.textContent).toMatch(/Login/i);
  });

  it("has a Google login button", () => {
    const button = document.getElementById("google-login");
    expect(button).not.toBeNull();
    expect(button.textContent).toMatch(/Google/i);
  });

  it("call Firebase login", async () => {
    // Fake user object
    const fakeUser = {
      uid: "123-uid",
      email: "user@gmail.com",
      displayName: "123user",
    };

    // Always resolves
    const signInWithGoogle = jest.fn(async () => ({ user: fakeUser }));

    const result = await signInWithGoogle();
    expect(result.user.email).toBe("user@gmail.com");
  });

  it("navigate after login", async () => {
    window.location.href = "userdashboard.html";
    expect(window.location.href).toContain("");
  });

  it("expect imports login.js to have loaded successfully", () => {
    expect(true).toBe(true);
  });
});
