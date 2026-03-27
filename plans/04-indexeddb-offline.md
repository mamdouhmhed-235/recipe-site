# IndexedDB & Offline Favorites Implementation Plan

## Overview
Persist favorite meals in IndexedDB for offline access. Users can view, add, and remove favorites without internet connection.

## File Structure
```
/client/src/features/favorites/
  db.ts              → IndexedDB database helpers
  hooks.ts           → React hooks for favorites
  types.ts           → TypeScript interfaces
```

## Database Schema

### IndexedDB Structure
```
Database: recipes-pwa
Version: 1
Object Stores:
  - favorites
    - Key: idMeal (string)
    - Value: Meal object with addedAt timestamp
    - Indexes:
      - addedAt (for sorting)
      - strCategory (for filtering)
```

## Implementation

### 1. Type Definitions

**src/features/favorites/types.ts**
```typescript
import { Meal } from '@/lib/api'

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

/**
 * Sort options for favorites
 */
export type SortOption = 'newest' | 'oldest' | 'name' | 'category'

/**
 * Filter options
 */
export interface FilterOptions {
  category?: string
  search?: string
}
```

### 2. IndexedDB Helpers

**src/features/favorites/db.ts**
```typescript
import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { Meal } from '@/lib/api'
import { 
  FavoriteMeal, 
  DB_NAME, 
  DB_VERSION, 
  STORE_NAME,
  SortOption,
  FilterOptions
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
```

### 3. React Hooks for Favorites

**src/features/favorites/hooks.ts**
```typescript
import { 
  useQuery, 
  useMutation, 
  useQueryClient 
} from '@tanstack/react-query'
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Meal } from '@/lib/api'
import {
  saveFavorite,
  removeFavorite,
  getFavorite,
  getAllFavorites,
  isFavorite,
  getFavoritesCount,
  getFavoriteCategories,
  clearAllFavorites
} from './db'
import { FavoriteMeal, SortOption, FilterOptions } from './types'

/**
 * Query keys for favorites
 */
export const favoritesKeys = {
  all: ['favorites'] as const,
  lists: () => [...favoritesKeys.all, 'list'] as const,
  list: (sort: SortOption, filters?: FilterOptions) => 
    [...favoritesKeys.lists(), { sort, filters }] as const,
  details: () => [...favoritesKeys.all, 'detail'] as const,
  detail: (id: string) => [...favoritesKeys.details(), id] as const,
  count: () => [...favoritesKeys.all, 'count'] as const,
  categories: () => [...favoritesKeys.all, 'categories'] as const
}

/**
 * Hook to get all favorites with sorting and filtering
 */
export function useFavorites(
  sort: SortOption = 'newest',
  filters?: FilterOptions
) {
  return useQuery({
    queryKey: favoritesKeys.list(sort, filters),
    queryFn: () => getAllFavorites(sort, filters),
    staleTime: Infinity, // Favorites are always fresh from IndexedDB
    gcTime: Infinity
  })
}

/**
 * Hook to get a single favorite
 */
export function useFavorite(mealId: string) {
  return useQuery({
    queryKey: favoritesKeys.detail(mealId),
    queryFn: () => getFavorite(mealId),
    enabled: !!mealId,
    staleTime: Infinity
  })
}

/**
 * Hook to check if a meal is favorited
 */
export function useIsFavorite(mealId: string) {
  return useQuery({
    queryKey: [...favoritesKeys.all, 'isFavorite', mealId],
    queryFn: () => isFavorite(mealId),
    enabled: !!mealId,
    staleTime: Infinity
  })
}

/**
 * Hook to get favorites count
 */
export function useFavoritesCount() {
  return useQuery({
    queryKey: favoritesKeys.count(),
    queryFn: getFavoritesCount,
    staleTime: Infinity
  })
}

/**
 * Hook to get favorite categories
 */
export function useFavoriteCategories() {
  return useQuery({
    queryKey: favoritesKeys.categories(),
    queryFn: getFavoriteCategories,
    staleTime: Infinity
  })
}

/**
 * Hook to add a meal to favorites
 */
export function useAddFavorite() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (meal: Meal) => saveFavorite(meal),
    onSuccess: (_, meal) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: favoritesKeys.all })
      
      toast.success('Added to favorites', {
        description: meal.strMeal,
        duration: 3000
      })
    },
    onError: (error) => {
      console.error('Error adding favorite:', error)
      toast.error('Failed to add favorite', {
        description: 'Please try again'
      })
    }
  })
}

/**
 * Hook to remove a meal from favorites
 */
export function useRemoveFavorite() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (mealId: string) => removeFavorite(mealId),
    onSuccess: (_, mealId) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: favoritesKeys.all })
      
      toast.success('Removed from favorites', {
        duration: 3000
      })
    },
    onError: (error) => {
      console.error('Error removing favorite:', error)
      toast.error('Failed to remove favorite', {
        description: 'Please try again'
      })
    }
  })
}

/**
 * Hook to toggle favorite status
 */
export function useToggleFavorite() {
  const addFavorite = useAddFavorite()
  const removeFavorite = useRemoveFavorite()
  
  const toggle = useCallback(async (meal: Meal, isCurrentlyFavorite: boolean) => {
    if (isCurrentlyFavorite) {
      await removeFavorite.mutateAsync(meal.idMeal)
    } else {
      await addFavorite.mutateAsync(meal)
    }
  }, [addFavorite, removeFavorite])
  
  return {
    toggle,
    isLoading: addFavorite.isPending || removeFavorite.isPending
  }
}

/**
 * Hook to clear all favorites
 */
export function useClearFavorites() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: clearAllFavorites,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: favoritesKeys.all })
      toast.success('All favorites cleared')
    },
    onError: (error) => {
      console.error('Error clearing favorites:', error)
      toast.error('Failed to clear favorites')
    }
  })
}

/**
 * Hook to manage favorites state with local state for instant UI updates
 */
export function useFavoritesManager() {
  const [sort, setSort] = useState<SortOption>('newest')
  const [filters, setFilters] = useState<FilterOptions>({})
  
  const { data: favorites = [], isLoading, error } = useFavorites(sort, filters)
  const { data: count = 0 } = useFavoritesCount()
  const { data: categories = [] } = useFavoriteCategories()
  
  const addFavorite = useAddFavorite()
  const removeFavorite = useRemoveFavorite()
  const toggleFavorite = useToggleFavorite()
  const clearFavorites = useClearFavorites()
  
  return {
    // Data
    favorites,
    count,
    categories,
    isLoading,
    error,
    
    // Sorting
    sort,
    setSort,
    
    // Filtering
    filters,
    setFilters,
    
    // Actions
    addFavorite: addFavorite.mutate,
    removeFavorite: removeFavorite.mutate,
    toggleFavorite: toggleFavorite.toggle,
    clearFavorites: clearFavorites.mutate,
    
    // Loading states
    isAdding: addFavorite.isPending,
    isRemoving: removeFavorite.isPending,
    isToggling: toggleFavorite.isLoading,
    isClearing: clearFavorites.isPending
  }
}

/**
 * Hook to sync favorites with online status
 * (Future: sync with server when back online)
 */
export function useFavoritesSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  // Future: Implement sync logic here
  // When coming back online, sync any pending changes
  
  return { isOnline }
}
```

### 4. Favorite Button Component

**src/components/recipe/FavoriteButton.tsx**
```typescript
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useIsFavorite, useToggleFavorite } from '@/features/favorites/hooks'
import { Meal } from '@/lib/api'

interface FavoriteButtonProps {
  meal: Meal
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
  showLabel?: boolean
  className?: string
}

export function FavoriteButton({
  meal,
  size = 'default',
  variant = 'ghost',
  showLabel = false,
  className
}: FavoriteButtonProps) {
  const { data: isFavorite = false, isLoading } = useIsFavorite(meal.idMeal)
  const { toggle, isLoading: isToggling } = useToggleFavorite()
  
  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    await toggle(meal, isFavorite)
  }
  
  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={isLoading || isToggling}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={isFavorite}
      className={cn(
        'transition-all duration-200',
        isFavorite && 'text-red-500 hover:text-red-600',
        className
      )}
    >
      <Heart
        className={cn(
          'h-4 w-4 transition-transform duration-200',
          isFavorite && 'fill-current scale-110',
          isToggling && 'animate-pulse'
        )}
      />
      {showLabel && (
        <span className="ml-2">
          {isFavorite ? 'Favorited' : 'Add to Favorites'}
        </span>
      )}
    </Button>
  )
}
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    React Component                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  useFavorites() hook                                 │  │
│  │  - Query: getAllFavorites()                          │  │
│  │  - Mutation: saveFavorite() / removeFavorite()       │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
│                            ▼                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  TanStack Query Cache                                │  │
│  │  - Keeps UI in sync                                  │  │
│  │  - Handles loading/error states                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
│                            ▼                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  IndexedDB (idb library)                             │  │
│  │  - Persistent storage                                │  │
│  │  - Works offline                                     │  │
│  │  - Fast reads/writes                                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Offline Behavior

### Online Mode
1. User clicks "Add to Favorites"
2. Meal saved to IndexedDB
3. UI updates immediately
4. Toast notification shown

### Offline Mode
1. App loads from service worker cache
2. Favorites load from IndexedDB
3. User can view all saved favorites
4. User can add/remove favorites
5. Changes persist in IndexedDB
6. Toast shows "Offline" status

### Coming Back Online
1. Service worker detects online status
2. App can fetch fresh data
3. Favorites remain in IndexedDB
4. (Future) Sync changes to server

## Testing Checklist

- [ ] Add favorite while online
- [ ] Add favorite while offline
- [ ] Remove favorite while online
- [ ] Remove favorite while offline
- [ ] View favorites while offline
- [ ] Sort favorites (newest, oldest, name, category)
- [ ] Filter favorites by category
- [ ] Search favorites
- [ ] Clear all favorites
- [ ] Favorites persist after app restart
- [ ] Favorites persist after service worker update
- [ ] Toast notifications work correctly
- [ ] Loading states display properly
- [ ] Error handling works

## Performance Considerations

1. **IndexedDB is fast**: Reads/writes are near-instant
2. **No network required**: Works completely offline
3. **Large capacity**: Can store thousands of favorites
4. **Efficient queries**: Indexes for sorting/filtering
5. **Lazy loading**: Only load what's needed

## Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| IndexedDB | ✅ 24+ | ✅ 16+ | ✅ 10+ | ✅ 12+ |
| idb library | ✅ All | ✅ All | ✅ All | ✅ All |

## Next Steps

1. Review this IndexedDB implementation plan
2. Proceed to:
   - `05-ui-components-pages.md` - Component and page implementations
   - `06-testing-deployment.md` - Testing and deployment guide
