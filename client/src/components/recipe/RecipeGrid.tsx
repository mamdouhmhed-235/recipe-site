import type { MealSummary, Meal } from '@/lib/api'
import { RecipeCard, RecipeCardSkeleton } from './RecipeCard'
import { cn } from '@/lib/utils'

interface RecipeGridProps {
  meals: (MealSummary | Meal)[]
  isLoading?: boolean
  skeletonCount?: number
  className?: string
}

export function RecipeGrid({ 
  meals, 
  isLoading = false, 
  skeletonCount = 8,
  className 
}: RecipeGridProps) {
  if (isLoading) {
    return (
      <div 
        className={cn(
          'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
          className
        )}
        aria-label="Loading recipes"
      >
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <RecipeCardSkeleton key={i} />
        ))}
      </div>
    )
  }
  
  if (meals.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No recipes found</p>
      </div>
    )
  }
  
  return (
    <div 
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
        className
      )}
      role="list"
      aria-label="Recipe list"
    >
      {meals.map((meal) => (
        <div key={meal.idMeal} role="listitem">
          <RecipeCard meal={meal} />
        </div>
      ))}
    </div>
  )
}