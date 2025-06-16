// Global setup for E2E tests
beforeAll(() => {
  // Configure test database or external services if needed
  console.log('🚀 Starting E2E test suite...');
});

afterAll(() => {
  // Cleanup after all tests
  console.log('✅ E2E test suite completed');
});

// Global timeout for async operations
jest.setTimeout(30000);

// Mock external services if needed
// jest.mock('some-external-service');
