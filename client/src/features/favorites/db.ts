import { openDB } from 'idb'
import type { DBSchema, IDBPDatabase } from 'idb'
import type { Meal } from '@/lib/api'
import type { 
  FavoriteMeal, 
  SortOption,
  FilterOptions
} from './types'
import { 
  DB_NAME, 
  DB_VERSION, 
  STORE_NAME
} from './types'

/**
 * Database schema interface
 */
interface RecipesDB extends DBSchema {
  favorites: {
    key: string
    value: FavoriteMeal
    indexes: {
      'by-addedAt': number
      'by-category': string
    }
  }
}

/**
 * Get database instance (singleton)
 */
let dbInstance: IDBPDatabase<RecipesDB> | null = null

async function getDB(): Promise<IDBPDatabase<RecipesDB>> {
  if (dbInstance) {
    return dbInstance
  }
  
  dbInstance = await openDB<RecipesDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create favorites object store
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'idMeal'
        })
        
        // Create indexes for sorting and filtering
        store.createIndex('by-addedAt', 'addedAt')
        store.createIndex('by-category', 'strCategory')
        
        console.log('[IndexedDB] Created favorites store')
      }
    },
    blocked() {
      console.warn('[IndexedDB] Database blocked')
    },
    blocking() {
      console.warn('[IndexedDB] Database blocking')
    },
    terminated() {
      console.error('[IndexedDB] Database terminated')
      dbInstance = null
    }
  })
  
  return dbInstance
}

/**
 * Save a meal to favorites
 */
export async function saveFavorite(meal: Meal): Promise<void> {
  try {
    const db = await getDB()
    
    const favorite: FavoriteMeal = {
      ...meal,
      addedAt: Date.now()
    }
    
    await db.put(STORE_NAME, favorite)
    console.log('[IndexedDB] Saved favorite:', meal.idMeal)
  } catch (error) {
    console.error('[IndexedDB] Error saving favorite:', error)
    throw new Error('Failed to save favorite')
  }
}

/**
 * Remove a meal from favorites
 */
export async function removeFavorite(mealId: string): Promise<void> {
  try {
    const db = await getDB()
    
    await db.delete(STORE_NAME, mealId)
    console.log('[IndexedDB] Removed favorite:', mealId)
  } catch (error) {
    console.error('[IndexedDB] Error removing favorite:', error)
    throw new Error('Failed to remove favorite')
  }
}

/**
 * Get a single favorite by ID
 */
export async function getFavorite(mealId: string): Promise<FavoriteMeal | undefined> {
  try {
    const db = await getDB()
    
    return await db.get(STORE_NAME, mealId)
  } catch (error) {
    console.error('[IndexedDB] Error getting favorite:', error)
    return undefined
  }
}

/**
 * Check if a meal is favorited
 */
export async function isFavorite(mealId: string): Promise<boolean> {
  try {
    const favorite = await getFavorite(mealId)
    return favorite !== undefined
  } catch (error) {
    console.error('[IndexedDB] Error checking favorite:', error)
    return false
  }
}

/**
 * Get all favorites with optional sorting and filtering
 */
export async function getAllFavorites(
  sort: SortOption = 'newest',
  filters?: FilterOptions
): Promise<FavoriteMeal[]> {
  try {
    const db = await getDB()
    
    let favorites: FavoriteMeal[]
    
    // Get all favorites
    if (filters?.category) {
      // Use category index for filtering
      favorites = await db.getAllFromIndex(
        STORE_NAME,
        'by-category',
        filters.category
      )
    } else {
      favorites = await db.getAll(STORE_NAME)
    }
    
    // Apply search filter
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase()
      favorites = favorites.filter(meal => 
        meal.strMeal.toLowerCase().includes(searchLower) ||
        meal.strCategory?.toLowerCase().includes(searchLower) ||
        meal.strArea?.toLowerCase().includes(searchLower)
      )
    }
    
    // Sort favorites
    favorites.sort((a, b) => {
      switch (sort) {
        case 'newest':
          return b.addedAt - a.addedAt
        case 'oldest':
          return a.addedAt - b.addedAt
        case 'name':
          return a.strMeal.localeCompare(b.strMeal)
        case 'category':
          return (a.strCategory || '').localeCompare(b.strCategory || '')
        default:
          return 0
      }
    })
    
    return favorites
  } catch (error) {
    console.error('[IndexedDB] Error getting all favorites:', error)
    return []
  }
}

/**
 * Get count of favorites
 */
export async function getFavoritesCount(): Promise<number> {
  try {
    const db = await getDB()
    return await db.count(STORE_NAME)
  } catch (error) {
    console.error('[IndexedDB] Error counting favorites:', error)
    return 0
  }
}

/**
 * Get all unique categories from favorites
 */
export async function getFavoriteCategories(): Promise<string[]> {
  try {
    const favorites = await getAllFavorites()
    const categories = new Set(favorites.map(f => f.strCategory).filter(Boolean))
    return Array.from(categories).sort()
  } catch (error) {
    console.error('[IndexedDB] Error getting categories:', error)
    return []
  }
}

/**
 * Clear all favorites (for testing or user request)
 */
export async function clearAllFavorites(): Promise<void> {
  try {
    const db = await getDB()
    await db.clear(STORE_NAME)
    console.log('[IndexedDB] Cleared all favorites')
  } catch (error) {
    console.error('[IndexedDB] Error clearing favorites:', error)
    throw new Error('Failed to clear favorites')
  }
}

/**
 * Export favorites as JSON (for backup)
 */
export async function exportFavorites(): Promise<string> {
  try {
    const favorites = await getAllFavorites()
    return JSON.stringify(favorites, null, 2)
  } catch (error) {
    console.error('[IndexedDB] Error exporting favorites:', error)
    throw new Error('Failed to export favorites')
  }
}

/**
 * Import favorites from JSON (for restore)
 */
export async function importFavorites(jsonString: string): Promise<number> {
  try {
    const favorites: FavoriteMeal[] = JSON.parse(jsonString)
    const db = await getDB()
    
    let imported = 0
    
    for (const favorite of favorites) {
      if (favorite.idMeal) {
        await db.put(STORE_NAME, favorite)
        imported++
      }
    }
    
    console.log('[IndexedDB] Imported', imported, 'favorites')
    return imported
  } catch (error) {
    console.error('[IndexedDB] Error importing favorites:', error)
    throw new Error('Failed to import favorites')
  }
}