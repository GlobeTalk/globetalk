/**
 * @jest-environment jsdom
 */
require('@testing-library/jest-dom');
const fs = require('fs');
const path = require('path');
const { screen } = require('@testing-library/dom');

beforeEach(() => {
  const html = fs.readFileSync(path.resolve(__dirname, '../../pages/findPal.html'), 'utf8');
  document.body.innerHTML = html;
});

// helper to simulate selecting a value
function selectOption(selectElement, value) {
  selectElement.value = value;
  selectElement.dispatchEvent(new Event('change', { bubbles: true }));
}

test('language dropdown', () => {
  const languageSelect = screen.getByLabelText(/Language preference/i);
  expect(languageSelect).toBeInTheDocument();
  expect(languageSelect.value).toBe('');

  selectOption(languageSelect, 'English');
  expect(languageSelect.value).toBe('English');
});

test('region dropdown', () => {
  const regionSelect = screen.getByLabelText(/Region\/Timezone/i);
  expect(regionSelect).toBeInTheDocument();
  expect(regionSelect.value).toBe('');

  selectOption(regionSelect, 'southafrica');
  expect(regionSelect.value).toBe('southafrica');
});

test('interest dropdown', () => {
  const interestSelect = screen.getByLabelText(/Interests/i);
  expect(interestSelect).toBeInTheDocument();
  expect(interestSelect.value).toBe('');

  selectOption(interestSelect, 'reading');
  expect(interestSelect.value).toBe('reading');
});
