import type { Meal, Category, MealSummary } from './types'

// Re-export types for convenience
export type { Meal, Category, MealSummary }

const API_BASE = '/api'

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `API error: ${response.status}`)
  }
  
  return response.json()
}

/**
 * Search meals by name
 */
export async function searchMeals(query: string) {
  return fetchAPI<{ meals: Meal[]; query: string }>(`/search?s=${encodeURIComponent(query)}`)
}

/**
 * Get meal details by ID
 */
export async function getMealById(id: string) {
  return fetchAPI<Meal>(`/meal/${id}`)
}

/**
 * Get all categories
 */
export async function getCategories() {
  return fetchAPI<{ categories: Category[] }>('/categories')
}

/**
 * Filter meals by category
 */
export async function filterByCategory(category: string) {
  return fetchAPI<{ meals: MealSummary[]; category: string }>(`/filter?c=${encodeURIComponent(category)}`)
}

/**
 * Get random meal
 */
export async function getRandomMeal() {
  return fetchAPI<Meal>('/random')
}