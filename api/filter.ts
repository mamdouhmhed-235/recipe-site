import type { VercelRequest, VercelResponse } from '@vercel/node';

const MEALDB_API_BASE = process.env.MEALDB_API_BASE || 'https://www.themealdb.com/api/json/v1';
const MEALDB_API_KEY = process.env.MEALDB_API_KEY || '1';

interface MealSummary {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
}

interface FilterResponse {
  meals: MealSummary[] | null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const category = req.query.c as string;

  if (!category || category.trim().length === 0) {
    return res.status(400).json({ error: 'Category is required' });
  }

  try {
    const sanitizedCategory = encodeURIComponent(category.trim());
    const url = `${MEALDB_API_BASE}/${MEALDB_API_KEY}/filter.php?c=${sanitizedCategory}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`TheMealDB API error: ${response.status}`);
    }
    
    const data = await response.json() as FilterResponse;
    
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
}
