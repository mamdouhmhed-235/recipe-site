import { useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Sparkles } from 'lucide-react'
import { searchMeals, getCategories, filterByCategory, getRandomMeal } from '@/lib/api'
import { RecipeGrid } from '@/components/recipe/RecipeGrid'
import { CategoryChip } from '@/components/recipe/CategoryChip'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import ErrorBoundary from '@/components/common/ErrorBoundary'

// Number of random meals to show on homepage
const RANDOM_MEALS_COUNT = 8

export function Home() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const searchQuery = searchParams.get('q') || ''
  const selectedCategory = searchParams.get('category') || ''
  
  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  })
  
  // Search meals
  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: () => searchMeals(searchQuery),
    enabled: !!searchQuery
  })
  
  // Filter by category
  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: ['filter', selectedCategory],
    queryFn: () => filterByCategory(selectedCategory),
    enabled: !!selectedCategory && !searchQuery
  })
  
  // Random meals for homepage - fetch multiple random meals
  const { data: randomMealsData, isLoading: randomLoading, refetch: refetchRandom } = useQuery({
    queryKey: ['random-meals'],
    queryFn: async () => {
      // Fetch multiple random meals in parallel
      const promises = Array.from({ length: RANDOM_MEALS_COUNT }, () => getRandomMeal())
      const results = await Promise.all(promises)
      return { meals: results.filter(Boolean) }
    },
    enabled: !searchQuery && !selectedCategory,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })
  
  const categories = categoriesData?.categories || []
  const meals = searchQuery
    ? (searchData?.meals || [])
    : selectedCategory
      ? (categoryData?.meals || [])
      : (randomMealsData?.meals || [])
  
  const isLoading = searchLoading || categoryLoading || randomLoading
  
  // Handle random recipe button click - navigate to the recipe
  const handleRandomRecipe = async () => {
    try {
      const meal = await getRandomMeal()
      if (meal?.idMeal) {
        navigate(`/meal/${meal.idMeal}`)
      }
    } catch (error) {
      console.error('Failed to fetch random meal:', error)
    }
  }
  
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-8">
        <h1 className="text-4xl font-bold mb-4">
          Discover Delicious Recipes
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
          Browse thousands of recipes from around the world. Save your favorites and access them offline.
        </p>
        <Button
          onClick={handleRandomRecipe}
          variant="outline"
          size="lg"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Random Recipe
        </Button>
      </section>
      
      {/* Categories */}
      <section aria-label="Recipe categories">
        <h2 className="text-2xl font-semibold mb-4">Categories</h2>
        {categoriesLoading ? (
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-24 rounded-full" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <CategoryChip
                key={category.idCategory}
                category={category}
                isSelected={selectedCategory === category.strCategory}
              />
            ))}
          </div>
        )}
      </section>
      
      {/* Results */}
      <section aria-label="Recipe results">
        <h2 className="text-2xl font-semibold mb-4">
          {searchQuery
            ? `Search results for "${searchQuery}"`
            : selectedCategory
              ? `${selectedCategory} Recipes`
              : 'Featured Recipes'}
        </h2>
        
        {isLoading ? (
          <RecipeGrid meals={[]} isLoading={true} />
        ) : meals.length > 0 ? (
          <RecipeGrid meals={meals} />
        ) : searchQuery || selectedCategory ? (
          <EmptyState
            icon="🔍"
            title="No recipes found"
            description="Try a different search term or category"
          />
        ) : (
          <EmptyState
            icon="🍳"
            title="Loading recipes..."
            description="Please wait while we fetch some delicious recipes for you"
          />
        )}
      </section>
    </div>
  )
}

export default function HomePage() {
  return (
    <ErrorBoundary>
      <Home />
    </ErrorBoundary>
  )
}