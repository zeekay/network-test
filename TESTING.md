# Integration Testing

This project includes Playwright integration tests to verify network connectivity functionality.

## Overview

The integration tests verify that the browser network connectivity tests work correctly by:

- Testing WebSocket connectivity (expects "Connected" status)
- Testing HTTP connectivity (expects "Completed" status)  
- Testing Server-Sent Events connectivity (expects "Completed" status)
- Verifying that at least 3 out of 4 network tests pass (excludes Proxied WebSocket)

## Running Tests

### Prerequisites

Ensure dependencies are installed:
```bash
npm install
```

### Test Commands

```bash
# Run tests in headless mode (CI/production)
npm test

# Run tests with visible browser (debugging)
npm run test:headed

# Run tests with Playwright UI (interactive debugging)
npm run test:ui
```

## How It Works

### Automatic Dev Server

The Playwright configuration automatically:
- Starts `npm run dev` before running tests
- Waits for the server to be available at `http://localhost:5173`
- Runs tests against the live application
- Shuts down the server after tests complete

### Test Strategy

1. **Individual Test Coverage**: Each network test type has its own test case
2. **Visual Verification**: Tests look for green status indicators and success text
3. **Smart Timeouts**: Different timeouts for different connection types:
   - WebSocket: 15 seconds
   - HTTP: 10 seconds  
   - SSE: 20 seconds (can take longer to establish)
4. **Summary Test**: Verifies overall success rate of 3+ passing tests

### Test Files

- `playwright.config.ts` - Playwright configuration with dev server setup
- `tests/network-integration.spec.ts` - Main integration test suite

## Troubleshooting

If tests fail:

1. **Check network connectivity** - Ensure you can access the Convex services
2. **Verify dev server** - Make sure `npm run dev` works independently
3. **Check timeouts** - Some network tests may need longer to establish connections
4. **Browser issues** - Try running with `--headed` to see what's happening visually

## CI/CD Integration

The tests are designed to work in CI environments with appropriate timeout settings and retry logic for flaky network conditions.