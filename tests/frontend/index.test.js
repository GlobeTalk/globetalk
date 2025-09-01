/**
 * @jest-environment jsdom
 */

import { JSDOM } from 'jsdom';

describe('GlobeTalk Landing Page', () => {
  let dom;
  let document;

  beforeAll(() => {
    // Create a DOM with the HTML content
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>GlobeTalk Landing</title>
        </head>
        <body>
          <h1>Welcome to GlobeTalk</h1>
          <a href="pages/login.html"><button id="joinBtn">Join Us</button></a>
          <script type="module" src="../scripts/index.js"></script>
        </body>
      </html>
    `);
    
    document = dom.window.document;
  });

  test('Join button exists with correct ID', () => {
    const button = document.getElementById('joinBtn');
    expect(button).not.toBeNull();
  });

  test('Button has correct text content', () => {
    const button = document.getElementById('joinBtn');
    expect(button.textContent).toBe('Join Us');
  });

  test('Button links to correct login page', () => {
    const link = document.querySelector('a');
    expect(link.getAttribute('href')).toBe('pages/login.html');
  });

  test('Button is wrapped in anchor tag', () => {
    const button = document.getElementById('joinBtn');
    const link = document.querySelector('a');
    expect(link.contains(button)).toBe(true);
  });

  test('Script tag exists with module type', () => {
    const script = document.querySelector('script[type="module"]');
    expect(script).not.toBeNull();
  });

  test('Script source is correct', () => {
    const script = document.querySelector('script[type="module"]');
    expect(script.getAttribute('src')).toBe('../scripts/index.js');
  });
});