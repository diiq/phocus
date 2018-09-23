module.exports = {
  preset: 'ts-jest',
  moduleFileExtensions: [
    "js",
    "jsx",
    "ts",
    "tsx"
  ],
  modulePaths: [
    "<rootDir>/src"
  ],
  setupTestFrameworkScriptFile: "<rootDir>/test-rig/test-setup.js",
  globals: {
    "PRODUCTION": false,
    "ts-jest": {
      diagnostics: false
    }
  }
};
