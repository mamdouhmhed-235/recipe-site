import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility', () => {
  test('home page has no accessibility violations', async ({ page }) => {
    await page.goto('/')
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('details page has no accessibility violations', async ({ page }) => {
    await page.goto('/meal/52772')
    await page.waitForSelector('article')
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('favorites page has no accessibility violations', async ({ page }) => {
    await page.goto('/favorites')
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('categories page has no accessibility violations', async ({ page }) => {
    await page.goto('/categories')
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/')
    
    // Tab through interactive elements
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Verify focus is visible
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })

  test('skip link works', async ({ page }) => {
    await page.goto('/')
    
    // Press Tab to focus skip link
    await page.keyboard.press('Tab')
    
    // Verify skip link is focused
    const skipLink = page.locator('.skip-link')
    await expect(skipLink).toBeFocused()
    
    // Press Enter to skip to main content
    await page.keyboard.press('Enter')
    
    // Verify main content is focused
    const mainContent = page.locator('#main-content')
    await expect(mainContent).toBeFocused()
  })
})
