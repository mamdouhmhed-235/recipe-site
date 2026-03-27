import type { VercelRequest, VercelResponse } from '@vercel/node';

const MEALDB_API_BASE = process.env.MEALDB_API_BASE || 'https://www.themealdb.com/api/json/v1';
const MEALDB_API_KEY = process.env.MEALDB_API_KEY || '1';

interface Meal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  [key: string]: string | undefined;
}

interface SearchResponse {
  meals: Meal[] | null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const query = req.query.s as string;

  if (!query || query.trim().length === 0) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const sanitizedQuery = encodeURIComponent(query.trim());
    const url = `${MEALDB_API_BASE}/${MEALDB_API_KEY}/search.php?s=${sanitizedQuery}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`TheMealDB API error: ${response.status}`);
    }
    
    const data = await response.json() as SearchResponse;
    
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
}
