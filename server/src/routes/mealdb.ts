import { Router, Request, Response } from 'express';
import { cacheMiddleware, CATEGORIES_TTL } from '../middleware/cache';
import { validateSearch, validateMealId, validateFilterCategory } from '../middleware/validate';
import {
  SearchResponse,
  CategoriesResponse,
  FilterResponse,
  Meal
} from '../types';

export const mealdbRouter = Router();

const MEALDB_API_BASE = process.env.MEALDB_API_BASE || 'https://www.themealdb.com/api/json/v1';
const MEALDB_API_KEY = process.env.MEALDB_API_KEY || '1';

/**
 * Helper to fetch from TheMealDB
 */
async function fetchFromMealDB(endpoint: string): Promise<unknown> {
  const url = `${MEALDB_API_BASE}/${MEALDB_API_KEY}/${endpoint}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`TheMealDB API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * GET /api/search?s={query}
 * Search meals by name
 */
mealdbRouter.get('/search', validateSearch, async (req: Request, res: Response) => {
  try {
    const query = req.query.s as string;
    
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    // Sanitize query
    const sanitizedQuery = encodeURIComponent(query.trim());
    
    const data = await fetchFromMealDB(`search.php?s=${sanitizedQuery}`) as SearchResponse;
    
    res.json({
      meals: data.meals || [],
      query: query.trim()
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'Failed to search meals',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/meal/:id
 * Get meal details by ID
 */
mealdbRouter.get('/meal/:id', validateMealId, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id || !/^\d+$/.test(id)) {
      return res.status(400).json({ error: 'Valid meal ID is required' });
    }
    
    const data = await fetchFromMealDB(`lookup.php?i=${id}`) as SearchResponse;
    
    if (!data.meals || data.meals.length === 0) {
      return res.status(404).json({ error: 'Meal not found' });
    }
    
    // Extract ingredients and measures
    const meal = data.meals[0];
    const ingredients: Array<{ ingredient: string; measure: string }> = [];
    
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}` as keyof Meal] as string;
      const measure = meal[`strMeasure${i}` as keyof Meal] as string;
      
      if (ingredient && ingredient.trim()) {
        ingredients.push({
          ingredient: ingredient.trim(),
          measure: measure?.trim() || ''
        });
      }
    }
    
    res.json({
      ...meal,
      ingredients
    });
  } catch (error) {
    console.error('Meal lookup error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch meal details',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/categories
 * List all meal categories
 * Cached for 5 minutes
 */
mealdbRouter.get('/categories', cacheMiddleware(CATEGORIES_TTL), async (req: Request, res: Response) => {
  try {
    const data = await fetchFromMealDB('categories.php') as CategoriesResponse;
    
    res.json({
      categories: data.categories || []
    });
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch categories',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/filter?c={category}
 * Filter meals by category
 */
mealdbRouter.get('/filter', validateFilterCategory, async (req: Request, res: Response) => {
  try {
    const category = req.query.c as string;
    
    if (!category || category.trim().length === 0) {
      return res.status(400).json({ error: 'Category is required' });
    }
    
    const sanitizedCategory = encodeURIComponent(category.trim());
    const data = await fetchFromMealDB(`filter.php?c=${sanitizedCategory}`) as FilterResponse;
    
    res.json({
      meals: data.meals || [],
      category: category.trim()
    });
  } catch (error) {
    console.error('Filter error:', error);
    res.status(500).json({ 
      error: 'Failed to filter meals',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/random
 * Get a random meal
 */
mealdbRouter.get('/random', async (req: Request, res: Response) => {
  try {
    const data = await fetchFromMealDB('random.php') as SearchResponse;
    
    if (!data.meals || data.meals.length === 0) {
      return res.status(404).json({ error: 'No random meal found' });
    }
    
    res.json(data.meals[0]);
  } catch (error) {
    console.error('Random meal error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch random meal',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
