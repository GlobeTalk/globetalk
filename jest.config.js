module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ["src/frontend/scripts/**/*.{js,jsx}"], // your real code
  coverageDirectory: "coverage",
  testMatch: ["**/tests/**/*.test.js"], // where your tests live
};
