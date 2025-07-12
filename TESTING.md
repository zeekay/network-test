# Testing Guide

This project uses Playwright for integration testing of network connectivity functionality.

## Overview

The integration tests verify that the network connectivity tests work correctly by:

- Testing WebSocket connectivity (should show "Connected")
- Testing HTTP connectivity (should show "Completed") 
- Testing Server-Sent Events connectivity (should show "Completed")
- Verifying the Proxied WebSocket test exists (but not testing for success as it requires proxy configuration)

## Running Tests

### Prerequisites

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install Playwright browsers:
   ```bash
   npx playwright install --with-deps
   ```

### Test Commands

```bash
# Run tests in headless mode (CI)
npm test

# Run tests with visible browser (debugging)
npm run test:headed

# Run tests with Playwright UI (interactive debugging)
npm run test:ui
```

## Test Configuration

- **Automatic Dev Server**: Playwright automatically starts `npm run dev` before running tests
- **Browser Support**: Tests run on Chromium, Firefox, and WebKit
- **Timeouts**: Extended timeouts for network operations (10-20 seconds per test)
- **Parallel Execution**: Tests run in parallel for faster execution

## Test Structure

### Main Test: `should verify 3 out of 4 network tests pass`

This test verifies the core functionality by checking that:

1. **WebSocket Test**: Establishes connection and shows "Connected" status
2. **HTTP Test**: Completes request and shows "Completed" status  
3. **Server-Sent Events Test**: Establishes streaming connection and shows "Completed" status
4. **Proxied WebSocket Test**: Exists but is not tested for success (requires proxy setup)

### Component Test: `should verify individual test components are functional`

This test verifies the UI structure and presence of all test components.

## Continuous Integration

The tests are configured to run in CI via `.github/workflows/ci.yaml`:

- Installs Node.js and dependencies
- Installs Playwright browsers
- Runs linting and build
- Executes Playwright tests
- Uploads test results as artifacts

## Troubleshooting

### Common Issues

1. **Dev server startup timeout**: The test waits up to 2 minutes for the dev server to start
2. **Network timeouts**: Individual tests have extended timeouts (10-20s) for network operations
3. **Browser installation**: Run `npx playwright install --with-deps` if browsers are missing

### Debug Mode

Run tests with visible browser to see what's happening:

```bash
npm run test:headed
```

### Test Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

## Test Environment

- **Base URL**: http://127.0.0.1:5173 (Vite dev server)
- **Dev Server**: Automatically managed by Playwright
- **Browsers**: Chromium, Firefox, WebKit (configurable in `playwright.config.ts`)