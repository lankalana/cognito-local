module.exports = {
  roots: ["<rootDir>/src"],
  setupFiles: ["jest-date-mock"],
  setupFilesAfterEnv: [
    "<rootDir>/setupTests.ts",
    "jest-extended/all"
  ],
  preset: 'ts-jest',
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  testMatch: ["**/*.test.ts"],
};
