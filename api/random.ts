import type { VercelRequest, VercelResponse } from '@vercel/node';

const MEALDB_API_BASE = process.env.MEALDB_API_BASE || 'https://www.themealdb.com/api/json/v1';
const MEALDB_API_KEY = process.env.MEALDB_API_KEY || '1';

interface Meal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strInstructions?: string;
  strCategory?: string;
  strArea?: string;
  strYoutube?: string;
  strSource?: string;
  [key: string]: string | undefined;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const url = `${MEALDB_API_BASE}/${MEALDB_API_KEY}/random.php`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`TheMealDB API error: ${response.status}`);
    }
    
    const data = await response.json() as { meals: Meal[] | null };
    
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
}
