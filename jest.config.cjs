module.exports = {
  roots: ["<rootDir>/src"],
  setupFiles: ["jest-date-mock"],
  setupFilesAfterEnv: [
    "<rootDir>/setupTests.ts",
  ],
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    "^.+\\.ts$": "@swc/jest",
  },
  testMatch: ["**/*.test.ts"],
};
