import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, MapPin, Clock, ExternalLink, Video, ChefHat } from 'lucide-react'
import { getMealById } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { IngredientList } from '@/components/recipe/IngredientList'
import { FavoriteButton } from '@/components/recipe/FavoriteButton'
import { YouTubeEmbed } from '@/components/recipe/YouTubeEmbed'
import { EmptyState } from '@/components/common/EmptyState'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import { parseInstructions } from '@/lib/utils'

export function Details() {
  const { id } = useParams<{ id: string }>()
  
  const { data: meal, isLoading, error } = useQuery({
    queryKey: ['meal', id],
    queryFn: () => getMealById(id!),
    enabled: !!id
  })
  
  if (isLoading) {
    return <DetailsSkeleton />
  }
  
  if (error || !meal) {
    return (
      <EmptyState
        icon="❌"
        title="Recipe not found"
        description="The recipe you're looking for doesn't exist or has been removed"
        action={
          <Button asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        }
      />
    )
  }
  
  return (
    <article className="max-w-4xl mx-auto">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-4">
        <Link to="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to recipes
        </Link>
      </Button>
      
      {/* Hero Image */}
      <div className="relative aspect-video rounded-lg overflow-hidden mb-6">
        <img
          src={meal.strMealThumb}
          alt={meal.strMeal}
          className="object-cover w-full h-full"
        />
        <div className="absolute top-4 right-4">
          <FavoriteButton 
            meal={meal} 
            size="lg" 
            variant="secondary"
            showLabel
            className="bg-background/80 backdrop-blur-sm"
          />
        </div>
      </div>
      
      {/* Title and Meta */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-4">{meal.strMeal}</h1>
        
        <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
          {meal.strCategory && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {meal.strCategory}
            </Badge>
          )}
          {meal.strArea && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {meal.strArea}
            </Badge>
          )}
          {meal.strTags && (
            <div className="flex flex-wrap gap-2">
              {meal.strTags.split(',').map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag.trim()}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </header>
      
      <Separator className="my-6" />
      
      {/* Content Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Ingredients */}
        <aside className="md:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Ingredients</h2>
          <IngredientList ingredients={meal.ingredients || []} />
        </aside>
        
        {/* Instructions */}
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Instructions
          </h2>
          <ol className="space-y-4">
            {parseInstructions(meal.strInstructions).map((step, index) => (
              <li key={index} className="flex gap-4">
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                  {index + 1}
                </span>
                <p className="text-muted-foreground leading-relaxed pt-1">
                  {step}
                </p>
              </li>
            ))}
          </ol>
          
          {/* YouTube Video */}
          {meal.strYoutube && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Video className="h-5 w-5 text-red-500" />
                Video Tutorial
              </h2>
              <YouTubeEmbed url={meal.strYoutube} />
            </div>
          )}
          
          {/* Source Link */}
          {meal.strSource && (
            <div className="mt-6">
              <Button variant="outline" asChild>
                <a
                  href={meal.strSource}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Original Recipe
                </a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

/**
 * Skeleton loader for Details page
 */
function DetailsSkeleton() {
  return (
    <div className="max-w-4xl mx-auto">
      <Skeleton className="h-10 w-32 mb-4" />
      <Skeleton className="aspect-video w-full rounded-lg mb-6" />
      <Skeleton className="h-10 w-3/4 mb-4" />
      <div className="flex gap-4 mb-6">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        <div>
          <Skeleton className="h-8 w-32 mb-4" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        </div>
        <div className="md:col-span-2">
          <Skeleton className="h-8 w-32 mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DetailsPage() {
  return (
    <ErrorBoundary>
      <Details />
    </ErrorBoundary>
  )
}