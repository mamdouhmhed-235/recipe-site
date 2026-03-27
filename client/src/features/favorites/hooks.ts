import { 
  useQuery, 
  useMutation, 
  useQueryClient 
} from '@tanstack/react-query'
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import type { Meal } from '@/lib/api'
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
import type { SortOption, FilterOptions } from './types'

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
    onSuccess: (_, _mealId) => {
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