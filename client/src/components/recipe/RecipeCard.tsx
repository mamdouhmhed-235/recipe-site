import { Link } from 'react-router-dom'
import { Clock, MapPin, Heart } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { FavoriteButton } from './FavoriteButton'
import type { MealSummary, Meal } from '@/lib/api'
import { cn } from '@/lib/utils'

interface RecipeCardProps {
  meal: MealSummary | Meal
  showDetails?: boolean
  className?: string
}

// Type guard to check if meal is a full Meal object
function isFullMeal(meal: MealSummary | Meal): meal is Meal {
  return 'strInstructions' in meal && 'strCategory' in meal
}

export function RecipeCard({ meal, showDetails = false, className }: RecipeCardProps) {
  const fullMeal = meal as Meal
  const hasDetails = isFullMeal(meal)
  
  return (
    <Card className={cn('overflow-hidden transition-all hover:shadow-lg', className)}>
      <Link 
        to={`/meal/${meal.idMeal}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`View ${meal.strMeal} recipe`}
      >
        {/* Image */}
        <div className="relative aspect-video overflow-hidden">
          <img
            src={meal.strMealThumb}
            alt={meal.strMeal}
            className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
          
          {/* Favorite Button Overlay */}
          <div className="absolute top-2 right-2">
            {hasDetails ? (
              <FavoriteButton 
                meal={fullMeal} 
                size="sm" 
                variant="secondary"
                className="bg-background/80 backdrop-blur-sm"
              />
            ) : (
              <Button 
                size="sm" 
                variant="secondary"
                className="bg-background/80 backdrop-blur-sm"
                disabled
                aria-label="Favorite details not available"
              >
                <Heart className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {/* Category Badge */}
          {hasDetails && fullMeal.strCategory && (
            <Badge 
              variant="secondary" 
              className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm"
            >
              {fullMeal.strCategory}
            </Badge>
          )}
        </div>
        
        <CardHeader className="pb-2">
          <h3 className="font-semibold text-lg line-clamp-2 leading-tight">
            {meal.strMeal}
          </h3>
        </CardHeader>
        
        <CardContent className="pb-2">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {hasDetails && fullMeal.strArea && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{fullMeal.strArea}</span>
              </div>
            )}
            {hasDetails && fullMeal.strCategory && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{fullMeal.strCategory}</span>
              </div>
            )}
          </div>
          
          {showDetails && hasDetails && fullMeal.strInstructions && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {fullMeal.strInstructions}
            </p>
          )}
        </CardContent>
      </Link>
      
      <CardFooter className="pt-2">
        <Button asChild variant="outline" className="w-full">
          <Link to={`/meal/${meal.idMeal}`}>
            View Recipe
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

/**
 * Skeleton loader for RecipeCard
 */
export function RecipeCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  )
}