module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/'
  ],
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 30000
};

