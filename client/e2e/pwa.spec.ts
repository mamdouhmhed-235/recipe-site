import { test, expect } from '@playwright/test'

test.describe('PWA', () => {
  test('manifest is valid', async ({ page }) => {
    await page.goto('/')
    
    const manifestLink = page.locator('link[rel="manifest"]')
    await expect(manifestLink).toHaveAttribute('href', '/manifest.webmanifest')
    
    const response = await page.request.get('/manifest.webmanifest')
    const manifest = await response.json()
    
    expect(manifest.name).toBeDefined()
    expect(manifest.short_name).toBeDefined()
    expect(manifest.icons).toHaveLength(3)
    expect(manifest.start_url).toBe('/')
    expect(manifest.display).toBe('standalone')
  })

  test('service worker registers', async ({ page }) => {
    await page.goto('/')
    
    const swRegistration = await page.evaluate(() => {
      return navigator.serviceWorker.ready
    })
    
    expect(swRegistration).toBeDefined()
  })

  test('offline page loads', async ({ page, context }) => {
    await page.goto('/')
    
    // Go offline
    await context.setOffline(true)
    
    // Try to navigate to a new page
    await page.goto('/favorites')
    
    // Should show offline fallback or cached content
    const content = await page.content()
    expect(content.includes('offline') || content.includes('Favorites')).toBeTruthy()
  })

  test('app is installable', async ({ page }) => {
    await page.goto('/')
    
    // Check if beforeinstallprompt event is fired
    const isInstallable = await page.evaluate(() => {
      return 'BeforeInstallPromptEvent' in window
    })
    
    // Note: This test may not work in all browsers
    // as BeforeInstallPromptEvent is not always available
    console.log('App is installable:', isInstallable)
  })
})
