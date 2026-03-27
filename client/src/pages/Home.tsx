import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Sparkles } from 'lucide-react'
import { searchMeals, getCategories, filterByCategory, getRandomMeal } from '@/lib/api'
import { RecipeGrid } from '@/components/recipe/RecipeGrid'
import { CategoryChip } from '@/components/recipe/CategoryChip'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import ErrorBoundary from '@/components/common/ErrorBoundary'

export function Home() {
  const [searchParams] = useSearchParams()
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
  
  // Random meal
  const { refetch: refetchRandom } = useQuery({
    queryKey: ['random'],
    queryFn: getRandomMeal,
    enabled: false
  })
  
  const categories = categoriesData?.categories || []
  const meals = searchQuery 
    ? (searchData?.meals || [])
    : selectedCategory 
      ? (categoryData?.meals || [])
      : []
  
  const isLoading = searchLoading || categoryLoading
  
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
          onClick={() => refetchRandom()}
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
              : 'Select a category or search for recipes'}
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
            title="Start exploring"
            description="Search for recipes or select a category to get started"
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