import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface IngredientListProps {
  ingredients: Array<{ ingredient: string; measure: string }>
  className?: string
}

export function IngredientList({ ingredients, className }: IngredientListProps) {
  if (ingredients.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">No ingredients listed</p>
    )
  }
  
  return (
    <ul 
      className={cn('space-y-2', className)}
      aria-label="Ingredients list"
    >
      {ingredients.map((item, index) => (
        <li 
          key={index}
          className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
        >
          <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span className="flex-1">
            <span className="font-medium">{item.measure}</span>
            <span className="text-muted-foreground"> {item.ingredient}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}