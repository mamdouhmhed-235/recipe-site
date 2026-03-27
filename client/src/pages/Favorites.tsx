import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Trash2, SortAsc, Filter, Loader2 } from 'lucide-react'
import { useFavoritesManager } from '@/features/favorites/hooks'
import { RecipeGrid } from '@/components/recipe/RecipeGrid'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { EmptyState } from '@/components/common/EmptyState'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import type { SortOption } from '@/features/favorites/types'

export function Favorites() {
  const {
    favorites,
    count,
    categories,
    isLoading,
    sort,
    setSort,
    filters,
    setFilters,
    clearFavorites,
    isClearing
  } = useFavoritesManager()
  
  const [searchInput, setSearchInput] = useState(filters.search || '')
  const [showClearDialog, setShowClearDialog] = useState(false)
  
  const handleSearch = (value: string) => {
    setSearchInput(value)
    setFilters({ ...filters, search: value || undefined })
  }
  
  const handleCategoryChange = (category: string) => {
    setFilters({ 
      ...filters, 
      category: category === 'all' ? undefined : category 
    })
  }
  
  const handleClearAll = () => {
    clearFavorites()
    setShowClearDialog(false)
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="h-8 w-8 text-red-500 fill-current" />
            My Favorites
            {isLoading && (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            {count} {count === 1 ? 'recipe' : 'recipes'} saved
          </p>
        </div>
        
        {count > 0 && (
          <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Clear all favorites?</DialogTitle>
                <DialogDescription>
                  This will remove all {count} recipes from your favorites. 
                  This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setShowClearDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleClearAll}
                  disabled={isClearing}
                >
                  {isClearing ? 'Clearing...' : 'Clear All'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      {/* Filters */}
      {count > 0 && (
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <Input
              placeholder="Search favorites..."
              value={searchInput}
              onChange={(e) => handleSearch(e.target.value)}
              aria-label="Search favorites"
            />
          </div>
          
          {/* Category Filter */}
          <Select
            value={filters.category || 'all'}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="w-full sm:w-48" aria-label="Filter by category">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Sort */}
          <Select
            value={sort}
            onValueChange={(value) => setSort(value as SortOption)}
          >
            <SelectTrigger className="w-full sm:w-48" aria-label="Sort favorites">
              <SortAsc className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="category">Category</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      {/* Favorites Grid */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading favorites...</span>
          </div>
          <RecipeGrid meals={[]} isLoading={true} />
        </div>
      ) : favorites.length > 0 ? (
        <RecipeGrid meals={favorites} />
      ) : (
        <EmptyState
          icon="❤️"
          title="No favorites yet"
          description="Start saving your favorite recipes to access them offline"
          action={
            <Button asChild>
              <Link to="/">Browse Recipes</Link>
            </Button>
          }
        />
      )}
    </div>
  )
}

export default function FavoritesPage() {
  return (
    <ErrorBoundary>
      <Favorites />
    </ErrorBoundary>
  )
}