import { test, expect } from '@playwright/test';

test.describe('Network Connectivity Tests', () => {
  test('should verify 3 out of 4 network tests pass', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the page to load and ensure all test components are present
    await expect(page.locator('h1').filter({ hasText: 'Browser Network Test' })).toBeVisible();
    
    // Test 1: WebSocket Test - should show "Connected"
    await test.step('WebSocket Test', async () => {
      const websocketTest = page.locator('details').filter({ hasText: /^WebSocket Test/ });
      await expect(websocketTest).toBeVisible();
      
      // Wait for WebSocket connection to establish (up to 15 seconds)
      await expect(websocketTest.locator('span').filter({ hasText: 'Connected' }).first()).toBeVisible({ timeout: 15000 });
      
      // Verify green status indicator
      await expect(websocketTest.locator('.bg-green-500')).toBeVisible();
    });
    
    // Test 2: HTTP Test - should show "Completed" 
    await test.step('HTTP Test', async () => {
      const httpTest = page.locator('details').filter({ hasText: 'HTTP Test' });
      await expect(httpTest).toBeVisible();
      
      // Wait for HTTP test to complete (up to 10 seconds)
      await expect(httpTest.locator('span').filter({ hasText: 'Completed' })).toBeVisible({ timeout: 10000 });
      
      // Verify green status indicator
      await expect(httpTest.locator('.bg-green-500')).toBeVisible();
    });
    
    // Test 3: Server-Sent Events Test - should show "Completed"
    await test.step('Server-Sent Events Test', async () => {
      const sseTest = page.locator('details').filter({ hasText: 'Server-Sent Events (SSE) Test' });
      await expect(sseTest).toBeVisible();
      
      // Wait for SSE test to complete (up to 20 seconds)
      await expect(sseTest.locator('span').filter({ hasText: 'Completed' })).toBeVisible({ timeout: 20000 });
      
      // Verify green status indicator  
      await expect(sseTest.locator('.bg-green-500')).toBeVisible();
    });
    
    // Test 4: Proxied WebSocket Test - SKIPPED as requested (requires proxy)
    // We verify it exists but don't test for success
    await test.step('Proxied WebSocket Test (Verification Only)', async () => {
      const proxiedTest = page.locator('details').filter({ hasText: 'Proxied WebSocket Test' });
      await expect(proxiedTest).toBeVisible();
      // Note: Not testing for success as this requires proxy configuration
    });
  });

  test('should verify individual test components are functional', async ({ page }) => {
    await page.goto('/');
    
    // Verify page structure
    await expect(page.locator('header')).toContainText('Convex Connection Tester');
    await expect(page.locator('h2')).toContainText('Connection Tests');
    
    // Verify all test sections are present
    await expect(page.locator('details').filter({ hasText: /^WebSocket Test/ })).toBeVisible();
    await expect(page.locator('details').filter({ hasText: 'HTTP Test' })).toBeVisible();
    await expect(page.locator('details').filter({ hasText: 'Server-Sent Events (SSE) Test' })).toBeVisible();
    await expect(page.locator('details').filter({ hasText: 'Proxied WebSocket Test' })).toBeVisible();
    
    // Verify each test section has a status indicator
    const testSections = page.locator('details');
    const testCount = await testSections.count();
    expect(testCount).toBe(4);
    
    for (let i = 0; i < testCount; i++) {
      const section = testSections.nth(i);
      // Each test should have a colored status indicator
      await expect(section.locator('div[class*="w-3 h-3 rounded-full"]')).toBeVisible();
    }
  });
});