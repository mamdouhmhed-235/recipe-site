import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useIsFavorite, useToggleFavorite } from '@/features/favorites/hooks'
import type { Meal } from '@/lib/api'
import { type ButtonProps } from '@/components/ui/button'

interface FavoriteButtonProps extends Omit<ButtonProps, 'onClick' | 'children' | 'ref'> {
  meal: Meal
  showLabel?: boolean
}

export function FavoriteButton({
  meal,
  showLabel = false,
  className,
  ...props
}: FavoriteButtonProps) {
  const { data: isFavorite = false, isLoading } = useIsFavorite(meal.idMeal)
  const { toggle, isLoading: isToggling } = useToggleFavorite()
  
  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    await toggle(meal, isFavorite)
  }
  
  return (
    <Button
      {...props}
      onClick={handleToggle}
      disabled={isLoading || isToggling}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={isFavorite}
      className={cn(
        'transition-all duration-200',
        isFavorite && 'text-red-500 hover:text-red-600',
        className
      )}
    >
      <Heart
        className={cn(
          'h-4 w-4 transition-transform duration-200',
          isFavorite && 'fill-current scale-110',
          isToggling && 'animate-pulse'
        )}
      />
      {showLabel && (
        <span className="ml-2">
          {isFavorite ? 'Favorited' : 'Add to Favorites'}
        </span>
      )}
    </Button>
  )
}