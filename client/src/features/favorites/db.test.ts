import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  saveFavorite,
  removeFavorite,
  getFavorite,
  isFavorite,
  getAllFavorites,
  getFavoritesCount,
  getFavoriteCategories,
  clearAllFavorites,
  exportFavorites,
  importFavorites
} from '@/features/favorites/db'
import type { Meal } from '@/lib/api'

// Mock console.log to suppress IndexedDB logs during tests
vi.spyOn(console, 'log').mockImplementation(() => {})
vi.spyOn(console, 'error').mockImplementation(() => {})

const mockMeal: Meal = {
  idMeal: '52772',
  strMeal: 'Test Meal',
  strMealThumb: 'https://example.com/image.jpg',
  strCategory: 'Chicken',
  strArea: 'Japanese',
  strInstructions: 'Test instructions for the recipe',
  strDrinkAlternate: null,
  strTags: null,
  strYoutube: null,
  strSource: null,
  strImageSource: null,
  strCreativeCommonsConfirmed: null,
  dateModified: null
}

const mockMeal2: Meal = {
  idMeal: '52773',
  strMeal: 'Another Test Meal',
  strMealThumb: 'https://example.com/image2.jpg',
  strCategory: 'Beef',
  strArea: 'American',
  strInstructions: 'More test instructions',
  strDrinkAlternate: null,
  strTags: null,
  strYoutube: null,
  strSource: null,
  strImageSource: null,
  strCreativeCommonsConfirmed: null,
  dateModified: null
}

describe('Favorites DB', () => {
  beforeEach(async () => {
    // Clear all favorites before each test
    await clearAllFavorites()
  })

  describe('saveFavorite', () => {
    it('saves a meal to favorites', async () => {
      await saveFavorite(mockMeal)
      
      const favorite = await getFavorite(mockMeal.idMeal)
      expect(favorite).toBeDefined()
      expect(favorite?.strMeal).toBe(mockMeal.strMeal)
    })

    it('adds timestamp when saving', async () => {
      await saveFavorite(mockMeal)
      
      const favorite = await getFavorite(mockMeal.idMeal)
      expect(favorite?.addedAt).toBeDefined()
      expect(typeof favorite?.addedAt).toBe('number')
    })
  })

  describe('removeFavorite', () => {
    it('removes a meal from favorites', async () => {
      await saveFavorite(mockMeal)
      await removeFavorite(mockMeal.idMeal)
      
      const favorite = await getFavorite(mockMeal.idMeal)
      expect(favorite).toBeUndefined()
    })
  })

  describe('getFavorite', () => {
    it('returns undefined for non-existent favorite', async () => {
      const favorite = await getFavorite('non-existent')
      expect(favorite).toBeUndefined()
    })

    it('returns the favorite meal', async () => {
      await saveFavorite(mockMeal)
      
      const favorite = await getFavorite(mockMeal.idMeal)
      expect(favorite).toBeDefined()
      expect(favorite?.idMeal).toBe(mockMeal.idMeal)
    })
  })

  describe('isFavorite', () => {
    it('returns false for non-favorite', async () => {
      const result = await isFavorite('non-existent')
      expect(result).toBe(false)
    })

    it('returns true for existing favorite', async () => {
      await saveFavorite(mockMeal)
      
      const result = await isFavorite(mockMeal.idMeal)
      expect(result).toBe(true)
    })
  })

  describe('getAllFavorites', () => {
    it('returns empty array when no favorites', async () => {
      const favorites = await getAllFavorites()
      expect(favorites).toEqual([])
    })

    it('returns all favorites', async () => {
      await saveFavorite(mockMeal)
      await saveFavorite(mockMeal2)
      
      const favorites = await getAllFavorites()
      expect(favorites).toHaveLength(2)
    })

    it('sorts by newest first by default', async () => {
      await saveFavorite(mockMeal)
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10))
      await saveFavorite(mockMeal2)
      
      const favorites = await getAllFavorites('newest')
      expect(favorites[0].idMeal).toBe(mockMeal2.idMeal)
    })

    it('sorts by oldest', async () => {
      await saveFavorite(mockMeal)
      await new Promise(resolve => setTimeout(resolve, 10))
      await saveFavorite(mockMeal2)
      
      const favorites = await getAllFavorites('oldest')
      expect(favorites[0].idMeal).toBe(mockMeal.idMeal)
    })

    it('sorts by name', async () => {
      await saveFavorite(mockMeal2) // "Another Test Meal"
      await saveFavorite(mockMeal)  // "Test Meal"
      
      const favorites = await getAllFavorites('name')
      expect(favorites[0].strMeal).toBe('Another Test Meal')
    })

    it('filters by search query', async () => {
      await saveFavorite(mockMeal)
      await saveFavorite(mockMeal2)
      
      const favorites = await getAllFavorites('newest', { search: 'Another' })
      expect(favorites).toHaveLength(1)
      expect(favorites[0].strMeal).toBe('Another Test Meal')
    })

    it('filters by category', async () => {
      await saveFavorite(mockMeal)
      await saveFavorite(mockMeal2)
      
      const favorites = await getAllFavorites('newest', { category: 'Chicken' })
      expect(favorites).toHaveLength(1)
      expect(favorites[0].strCategory).toBe('Chicken')
    })
  })

  describe('getFavoritesCount', () => {
    it('returns 0 when no favorites', async () => {
      const count = await getFavoritesCount()
      expect(count).toBe(0)
    })

    it('returns correct count', async () => {
      await saveFavorite(mockMeal)
      await saveFavorite(mockMeal2)
      
      const count = await getFavoritesCount()
      expect(count).toBe(2)
    })
  })

  describe('getFavoriteCategories', () => {
    it('returns empty array when no favorites', async () => {
      const categories = await getFavoriteCategories()
      expect(categories).toEqual([])
    })

    it('returns unique sorted categories', async () => {
      await saveFavorite(mockMeal)    // Chicken
      await saveFavorite(mockMeal2)   // Beef
      
      const categories = await getFavoriteCategories()
      expect(categories).toContain('Chicken')
      expect(categories).toContain('Beef')
    })
  })

  describe('clearAllFavorites', () => {
    it('clears all favorites', async () => {
      await saveFavorite(mockMeal)
      await saveFavorite(mockMeal2)
      
      await clearAllFavorites()
      
      const count = await getFavoritesCount()
      expect(count).toBe(0)
    })
  })

  describe('exportFavorites', () => {
    it('exports favorites as JSON string', async () => {
      await saveFavorite(mockMeal)
      
      const exported = await exportFavorites()
      const parsed = JSON.parse(exported)
      
      expect(Array.isArray(parsed)).toBe(true)
      expect(parsed).toHaveLength(1)
    })
  })

  describe('importFavorites', () => {
    it('imports favorites from JSON string', async () => {
      const json = JSON.stringify([
        { ...mockMeal, addedAt: Date.now() },
        { ...mockMeal2, addedAt: Date.now() }
      ])
      
      const imported = await importFavorites(json)
      expect(imported).toBe(2)
      
      const count = await getFavoritesCount()
      expect(count).toBe(2)
    })

    it('skips invalid entries', async () => {
      const json = JSON.stringify([
        { ...mockMeal, addedAt: Date.now() },
        { strMeal: 'Invalid - no idMeal' }
      ])
      
      const imported = await importFavorites(json)
      expect(imported).toBe(1)
    })
  })
})
