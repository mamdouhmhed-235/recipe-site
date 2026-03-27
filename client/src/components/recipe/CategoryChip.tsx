import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { Category } from '@/lib/api'

interface CategoryChipProps {
  category: Category
  isSelected?: boolean
  className?: string
}

export function CategoryChip({ 
  category, 
  isSelected = false, 
  className 
}: CategoryChipProps) {
  return (
    <Link
      to={`/?category=${encodeURIComponent(category.strCategory)}`}
      className={cn(
        'inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
        'hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isSelected 
          ? 'bg-primary text-primary-foreground shadow-md' 
          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        className
      )}
      aria-label={`Filter by ${category.strCategory} category`}
      aria-pressed={isSelected}
    >
      <img
        src={category.strCategoryThumb}
        alt=""
        className="w-6 h-6 rounded-full mr-2 object-cover"
        aria-hidden="true"
      />
      <span>{category.strCategory}</span>
    </Link>
  )
}