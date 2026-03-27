import type { Meal, SortOption, FilterOptions } from '@/lib/types'

/**
 * Favorite meal with metadata
 */
export interface FavoriteMeal extends Meal {
  addedAt: number // Timestamp when added to favorites
}

/**
 * Database schema version
 */
export const DB_NAME = 'recipes-pwa'
export const DB_VERSION = 1
export const STORE_NAME = 'favorites'

// Re-export types from shared types file
export type { SortOption, FilterOptions }