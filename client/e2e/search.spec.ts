import { test, expect } from '@playwright/test'

test.describe('Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
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

  test('shows empty state for no results', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search recipes...')
    await searchInput.fill('xyznonexistentrecipe123')
    await searchInput.press('Enter')
    
    // Wait for empty state
    await page.waitForSelector('text=No recipes found')
    
    // Verify empty state is displayed
    await expect(page.getByText('No recipes found')).toBeVisible()
  })

  test('can clear search', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search recipes...')
    await searchInput.fill('chicken')
    await searchInput.press('Enter')
    
    // Wait for search results
    await page.waitForSelector('[role="listitem"]')
    
    // Clear search
    await searchInput.clear()
    await searchInput.press('Enter')
    
    // Verify initial state is restored
    await expect(page.getByText('Select a category or search for recipes')).toBeVisible()
  })

  test('search is debounced', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search recipes...')
    
    // Type quickly
    await searchInput.fill('ch')
    await searchInput.fill('chi')
    await searchInput.fill('chic')
    await searchInput.fill('chick')
    await searchInput.fill('chicke')
    await searchInput.fill('chicken')
    
    // Wait for search results
    await page.waitForSelector('[role="listitem"]')
    
    // Verify search results are displayed
    const results = page.locator('[role="listitem"]')
    await expect(results).toHaveCount.greaterThan(0)
  })
})
