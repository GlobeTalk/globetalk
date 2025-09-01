
import { JSDOM } from "jsdom";
import { getHeaderText, getJoinButtonText, getJoinButtonLink } from "../../src/frontend/scripts/index.js";

describe("Landing Page JS", () => {
  let container;

  beforeEach(() => {
    
    const html = `
      <html>
        <body>
          <h1>Welcome to GlobeTalk</h1>
          <a href="pages/login.html"><button id="joinBtn">Join Us</button></a>
        </body>
      </html>
    `;

    const dom = new JSDOM(html);
    container = dom.window.document;
    
    
    global.document = container;
  });

  test("header text is correct", () => {
    expect(getHeaderText()).toBe("Welcome to GlobeTalk");
  });

  test("Join button text is correct", () => {
    expect(getJoinButtonText()).toBe("Join Us");
  });

  test("Join button links to login.html", () => {
    expect(getJoinButtonLink()).toBe("pages/login.html");
  });
});
