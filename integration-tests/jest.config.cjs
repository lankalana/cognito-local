module.exports = {
  roots: ["."],
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    "^.+\\.ts$": "@swc/jest",
  },
  testMatch: ["**/*.test.ts"],
};
