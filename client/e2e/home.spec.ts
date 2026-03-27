import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Recipes PWA/)
  })

  test('displays hero section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /discover delicious recipes/i })).toBeVisible()
  })

  test('displays categories section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /categories/i })).toBeVisible()
  })

  test('can search for recipes', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search recipes...')
    await searchInput.fill('chicken')
    await searchInput.press('Enter')
    
    // Wait for search results
    await page.waitForSelector('[role="listitem"]')
    
    // Verify search results are displayed
    const results = page.locator('[role="listitem"]')
    await expect(results).toHaveCount.greaterThan(0)
  })

  test('can click on a category', async ({ page }) => {
    // Wait for categories to load
    await page.waitForSelector('[role="listitem"]')
    
    // Click on first category
    const firstCategory = page.locator('[role="listitem"]').first()
    await firstCategory.click()
    
    // Verify URL changes to include category parameter
    await expect(page).toHaveURL(/category=/)
  })

  test('can navigate to recipe details', async ({ page }) => {
    // Wait for recipes to load
    await page.waitForSelector('[role="listitem"]')
    
    // Click on first recipe
    const firstRecipe = page.locator('[role="listitem"]').first()
    await firstRecipe.click()
    
    // Verify navigation to details page
    await expect(page).toHaveURL(/\/meal\//)
  })
})
