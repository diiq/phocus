module.exports = {
  preset: "ts-jest",
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
  modulePaths: ["<rootDir>/src"],
  setupFilesAfterEnv: ["<rootDir>/test-rig/test-setup.js"],
  testEnvironment: "jsdom",
  globals: {
    PRODUCTION: false,
  },
};
