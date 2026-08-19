/** Configures the SDK Jest harness to execute TypeScript tests with the declared ts-jest dependency. */

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/**/*.test.ts"],
};
