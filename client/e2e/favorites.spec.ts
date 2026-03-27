import { test, expect } from '@playwright/test'

test.describe('Favorites', () => {
  test.beforeEach(async ({ page }) => {
    // Clear IndexedDB before each test
    await page.goto('/')
    await page.evaluate(() => {
      return indexedDB.deleteDatabase('recipes-pwa')
    })
  })

  test('can add and view favorites', async ({ page }) => {
    // Navigate to home
    await page.goto('/')
    
    // Wait for recipes to load
    await page.waitForSelector('[role="listitem"]')
    
    // Click first recipe
    const firstRecipe = page.locator('[role="listitem"]').first()
    await firstRecipe.click()
    
    // Click favorite button
    const favoriteButton = page.locator('[aria-label*="favorite"]')
    await favoriteButton.click()
    
    // Navigate to favorites
    await page.goto('/favorites')
    
    // Verify recipe appears in favorites
    await expect(page.locator('[role="listitem"]')).toHaveCount(1)
  })

  test('favorites work offline', async ({ page, context }) => {
    // Add a favorite while online
    await page.goto('/')
    await page.waitForSelector('[role="listitem"]')
    const firstRecipe = page.locator('[role="listitem"]').first()
    await firstRecipe.click()
    await page.locator('[aria-label*="favorite"]').click()
    
    // Go offline
    await context.setOffline(true)
    
    // Navigate to favorites
    await page.goto('/favorites')
    
    // Verify favorite is still visible
    await expect(page.locator('[role="listitem"]')).toHaveCount(1)
  })

  test('can remove favorites', async ({ page }) => {
    // Add a favorite
    await page.goto('/')
    await page.waitForSelector('[role="listitem"]')
    const firstRecipe = page.locator('[role="listitem"]').first()
    await firstRecipe.click()
    await page.locator('[aria-label*="favorite"]').click()
    
    // Navigate to favorites
    await page.goto('/favorites')
    
    // Remove the favorite
    const removeButton = page.locator('[aria-label*="remove"]')
    await removeButton.click()
    
    // Verify favorites is empty
    await expect(page.locator('[role="listitem"]')).toHaveCount(0)
  })

  test('can search favorites', async ({ page }) => {
    // Add multiple favorites
    await page.goto('/')
    await page.waitForSelector('[role="listitem"]')
    
    // Add first recipe
    const firstRecipe = page.locator('[role="listitem"]').first()
    await firstRecipe.click()
    await page.locator('[aria-label*="favorite"]').click()
    
    // Go back and add second recipe
    await page.goto('/')
    await page.waitForSelector('[role="listitem"]')
    const secondRecipe = page.locator('[role="listitem"]').nth(1)
    await secondRecipe.click()
    await page.locator('[aria-label*="favorite"]').click()
    
    // Navigate to favorites
    await page.goto('/favorites')
    
    // Search for specific favorite
    const searchInput = page.getByPlaceholder('Search favorites...')
    await searchInput.fill('chicken')
    
    // Verify search results
    const results = page.locator('[role="listitem"]')
    await expect(results).toHaveCount.greaterThan(0)
  })
})
