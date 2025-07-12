import { test, expect } from '@playwright/test';

test.describe('Network Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load and initial state to settle
    await page.waitForSelector('h1:has-text("Browser Network Test")', { timeout: 10000 });
  });

  test('should verify WebSocket Test shows Connected', async ({ page }) => {
    // Wait for WebSocket test section
    const websocketSection = page.locator('summary:has-text("WebSocket Test")');
    await expect(websocketSection).toBeVisible();
    
    // Check for green indicator and "Connected" status
    const greenIndicator = websocketSection.locator('.bg-green-500');
    const connectedStatus = websocketSection.locator('text=Connected');
    
    // Wait up to 15 seconds for connection to establish
    await expect(greenIndicator).toBeVisible({ timeout: 15000 });
    await expect(connectedStatus).toBeVisible({ timeout: 15000 });
    
    console.log('✅ WebSocket Test: Connected');
  });

  test('should verify HTTP Test shows Completed', async ({ page }) => {
    // Wait for HTTP test section  
    const httpSection = page.locator('summary:has-text("HTTP Test")');
    await expect(httpSection).toBeVisible();
    
    // Check for green indicator and "Completed" status
    const greenIndicator = httpSection.locator('.bg-green-500');
    const completedStatus = httpSection.locator('text=Completed');
    
    // Wait up to 10 seconds for HTTP test to complete
    await expect(greenIndicator).toBeVisible({ timeout: 10000 });
    await expect(completedStatus).toBeVisible({ timeout: 10000 });
    
    console.log('✅ HTTP Test: Completed');
  });

  test('should verify Server-Sent Events Test shows Completed', async ({ page }) => {
    // Wait for SSE test section
    const sseSection = page.locator('summary:has-text("Server-Sent Events")');
    await expect(sseSection).toBeVisible();
    
    // Check for green indicator and "Completed" status
    const greenIndicator = sseSection.locator('.bg-green-500');
    const completedStatus = sseSection.locator('text=Completed');
    
    // Wait up to 20 seconds for SSE test to complete (can take longer)
    await expect(greenIndicator).toBeVisible({ timeout: 20000 });
    await expect(completedStatus).toBeVisible({ timeout: 20000 });
    
    console.log('✅ Server-Sent Events Test: Completed');
  });

  test('should verify 3 out of 4 network tests pass', async ({ page }) => {
    // Wait for all test sections to be visible
    await expect(page.locator('summary:has-text("WebSocket Test")')).toBeVisible();
    await expect(page.locator('summary:has-text("HTTP Test")')).toBeVisible();
    await expect(page.locator('summary:has-text("Server-Sent Events")')).toBeVisible();
    await expect(page.locator('summary:has-text("Proxied WebSocket Test")')).toBeVisible();

    // Count green indicators (successful tests)
    // Wait for tests to complete
    await page.waitForTimeout(25000);
    
    const greenIndicators = page.locator('.bg-green-500');
    const greenCount = await greenIndicators.count();
    
    // We expect at least 3 green indicators (successful tests)
    expect(greenCount).toBeGreaterThanOrEqual(3);
    
    console.log(`✅ Network Tests Summary: ${greenCount}/4 tests passed`);
    console.log('🎯 Target achieved: 3+ tests passing as expected');
  });
});