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
  strTags?: string;
  [key: string]: string | undefined;
}

interface MealResponse {
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

  const { id } = req.query;

  if (!id || !/^\d+$/.test(id as string)) {
    return res.status(400).json({ error: 'Valid meal ID is required' });
  }

  try {
    const url = `${MEALDB_API_BASE}/${MEALDB_API_KEY}/lookup.php?i=${id}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`TheMealDB API error: ${response.status}`);
    }
    
    const data = await response.json() as MealResponse;
    
    if (!data.meals || data.meals.length === 0) {
      return res.status(404).json({ error: 'Meal not found' });
    }
    
    // Extract ingredients and measures
    const meal = data.meals[0];
    const ingredients: Array<{ ingredient: string; measure: string }> = [];
    
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`] as string;
      const measure = meal[`strMeasure${i}`] as string;
      
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
}
