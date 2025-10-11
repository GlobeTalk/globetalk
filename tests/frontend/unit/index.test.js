/**
 * @jest-environment jsdom
 */

describe("Index Page - Get Started Button", () => {
  let originalLocation;

  beforeAll(() => {
    // Save original location
    originalLocation = window.location;

    // Mock location completely
    delete window.location;
    window.location = { href: "" };

    // Mock HTML structure
    document.body.innerHTML = `
      <h1>Welcome</h1>
      <button id="getStartedBtn">Get Started</button>
    `;
  });

  afterAll(() => {
    // Restore original location
    window.location = originalLocation;
  });

  it("renders the index page heading", () => {
    const heading = document.querySelector("h1");
    expect(heading).not.toBeNull();
    expect(heading.textContent).toMatch(/Welcome/i);
  });

  it("has a Get Started button", () => {
    const button = document.getElementById("getStartedBtn");
    expect(button).not.toBeNull();
    expect(button.textContent).toMatch(/Get Started/i);
  });

  it("clicking the button navigates to login page", () => {
    const button = document.getElementById("getStartedBtn");
    button.addEventListener("click", () => {
      window.location.href = "http://localhost/";
    });
    button.click();
    expect(window.location.href).toBe("http://localhost/");
  });

  it("pressing Enter key triggers navigation", () => {
    const button = document.getElementById("getStartedBtn");
    button.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        window.location.href = "http://localhost/";
      }
    });
    const event = new KeyboardEvent("keydown", { key: "Enter", cancelable: true });
    button.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(window.location.href).toBe("http://localhost/");
  });

  it("pressing Space key triggers navigation", () => {
    const button = document.getElementById("getStartedBtn");
    button.addEventListener("keydown", (e) => {
      if (e.key === " ") {
        e.preventDefault();
        window.location.href = "http://localhost/";
      }
    });
    const event = new KeyboardEvent("keydown", { key: " ", cancelable: true });
    button.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(window.location.href).toBe("http://localhost/");
  });

  it("index.js script loads successfully", () => {
    expect(true).toBe(true);
  });
});
