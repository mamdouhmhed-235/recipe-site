# UI Components & Pages Implementation Plan

## Overview
Complete UI implementation with shadcn/ui components, pages, and accessibility features.

## Component Architecture

```
src/components/
  ui/                    → shadcn/ui base components
    button.tsx
    card.tsx
    input.tsx
    badge.tsx
    dialog.tsx
    skeleton.tsx
    toast.tsx
    toaster.tsx
    sonner.tsx
    theme-toggle.tsx
    dropdown-menu.tsx
    label.tsx
    separator.tsx
  layout/                → Layout components
    Header.tsx
    Layout.tsx
    Footer.tsx
  recipe/                → Recipe-specific components
    RecipeCard.tsx
    RecipeGrid.tsx
    CategoryChip.tsx
    IngredientList.tsx
    InstructionsList.tsx
    YouTubeEmbed.tsx
    NutritionInfo.tsx
  common/                → Shared components
    ErrorBoundary.tsx
    EmptyState.tsx
    LoadingSpinner.tsx
    SearchBar.tsx
    SortSelect.tsx
    FilterSelect.tsx
    OfflineIndicator.tsx
    InstallPrompt.tsx
```

## Pages

```
src/pages/
  Home.tsx               → Search, categories, recipe grid
  Details.tsx            → Full recipe view
  Favorites.tsx          → Saved favorites (offline-capable)
```

## Implementation Details

### 1. Layout Components

**src/components/layout/Header.tsx**
```typescript
import { Link, useLocation } from 'react-router-dom'
import { Search, Heart, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { SearchBar } from '@/components/common/SearchBar'
import { useFavoritesCount } from '@/features/favorites/hooks'
import { cn } from '@/lib/utils'

export function Header() {
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: favoritesCount = 0 } = useFavoritesCount()
  
  const isActive = (path: string) => location.pathname === path
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center space-x-2"
          aria-label="Recipes PWA Home"
        >
          <span className="text-2xl">🍳</span>
          <span className="font-bold text-xl hidden sm:inline">Recipes</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6" aria-label="Main navigation">
          <Link
            to="/"
            className={cn(
              'text-sm font-medium transition-colors hover:text-primary',
              isActive('/') ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            Home
          </Link>
          <Link
            to="/favorites"
            className={cn(
              'text-sm font-medium transition-colors hover:text-primary flex items-center',
              isActive('/favorites') ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <Heart className="h-4 w-4 mr-1" />
            Favorites
            {favoritesCount > 0 && (
              <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                {favoritesCount}
              </span>
            )}
          </Link>
        </nav>
        
        {/* Search Bar (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <SearchBar />
        </div>
        
        {/* Actions */}
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container py-4 space-y-4">
            <SearchBar />
            <nav className="flex flex-col space-y-2" aria-label="Mobile navigation">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive('/') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                )}
              >
                Home
              </Link>
              <Link
                to="/favorites"
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center',
                  isActive('/favorites') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                )}
              >
                <Heart className="h-4 w-4 mr-2" />
                Favorites
                {favoritesCount > 0 && (
                  <span className="ml-auto bg-background text-foreground text-xs rounded-full px-2 py-0.5">
                    {favoritesCount}
                  </span>
                )}
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
```

**src/components/layout/Layout.tsx**
```typescript
import { ReactNode } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { OfflineIndicator } from '@/components/common/OfflineIndicator'
import { InstallPrompt } from '@/components/common/InstallPrompt'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Skip Link for Accessibility */}
      <a 
        href="#main-content" 
        className="skip-link"
      >
        Skip to main content
      </a>
      
      <Header />
      
      <main 
        id="main-content" 
        className="flex-1 container py-6"
        role="main"
      >
        {children}
      </main>
      
      <Footer />
      
      {/* Global Components */}
      <OfflineIndicator />
      <InstallPrompt />
    </div>
  )
}

export default Layout
```

### 2. Recipe Components

**src/components/recipe/RecipeCard.tsx**
```typescript
import { Link } from 'react-router-dom'
import { Clock, MapPin, Heart } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { FavoriteButton } from './FavoriteButton'
import { MealSummary, Meal } from '@/lib/api'
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
```

**src/components/recipe/RecipeGrid.tsx**
```typescript
import { MealSummary, Meal } from '@/lib/api'
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
```

**src/components/recipe/IngredientList.tsx**
```typescript
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
```

### 3. Common Components

**src/components/common/SearchBar.tsx**
```typescript
import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { debounce } from '@/lib/utils'

interface SearchBarProps {
  placeholder?: string
  className?: string
}

export function SearchBar({ 
  placeholder = 'Search recipes...',
  className 
}: SearchBarProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [value, setValue] = useState(searchParams.get('q') || '')
  
  // Debounced search
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query.trim()) {
        navigate(`/?q=${encodeURIComponent(query.trim())}`)
      } else {
        navigate('/')
      }
    }, 300),
    [navigate]
  )
  
  useEffect(() => {
    debouncedSearch(value)
  }, [value, debouncedSearch])
  
  const handleClear = () => {
    setValue('')
    navigate('/')
  }
  
  return (
    <form 
      onSubmit={(e) => e.preventDefault()}
      className={className}
      role="search"
    >
      <div className="relative">
        <Search 
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" 
          aria-hidden="true"
        />
        <Input
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="pl-10 pr-10"
          aria-label="Search recipes"
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </form>
  )
}
```

**src/components/common/EmptyState.tsx**
```typescript
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return (
    <div 
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
      role="status"
    >
      {icon && (
        <div className="text-4xl mb-4" aria-hidden="true">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-4 max-w-md">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
```

**src/components/common/OfflineIndicator.tsx**
```typescript
import { useState, useEffect } from 'react'
import { Wifi, WifiOff } from 'lucide-react'
import { toast } from 'sonner'

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      toast.success('Back online', {
        duration: 3000
      })
    }
    
    const handleOffline = () => {
      setIsOnline(false)
      toast.warning('You are offline', {
        description: 'Favorites are still available',
        duration: 5000
      })
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  // Don't render anything, just handle toasts
  return null
}
```

### 5. Missing Component Implementations

**src/components/common/ErrorBoundary.tsx**
```typescript
import { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            We encountered an unexpected error. Please try refreshing the page or navigate back to home.
          </p>
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
```

**src/components/layout/Footer.tsx**
```typescript
import { Heart, Github, Twitter, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link 
              to="/" 
              className="flex items-center space-x-2"
              aria-label="Recipes PWA Home"
            >
              <span className="text-2xl">🍳</span>
              <span className="font-bold text-xl">Recipes</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Browse thousands of recipes from around the world. Save favorites and access them offline.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Quick Links</h3>
            <nav className="flex flex-col space-y-2">
              <Link 
                to="/" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Browse Recipes
              </Link>
              <Link 
                to="/favorites" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                My Favorites
              </Link>
              <Link 
                to="/categories" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Categories
              </Link>
            </nav>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="font-semibold">Features</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                Offline Access
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                Save Favorites
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                PWA Support
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                Dark/Light Theme
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h3 className="font-semibold">Connect</h3>
            <div className="flex space-x-4">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="mailto:contact@recipes.app" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
            <p className="text-sm text-muted-foreground">
              Powered by TheMealDB API
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Recipes PWA. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              Made with <Heart className="h-4 w-4 text-red-500 fill-current" /> for food lovers
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
```

**src/components/recipe/YouTubeEmbed.tsx**
```typescript
import { useState } from 'react'
import { Play, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getYouTubeVideoId } from '@/lib/utils'

interface YouTubeEmbedProps {
  url: string
  className?: string
}

export function YouTubeEmbed({ url, className }: YouTubeEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const videoId = getYouTubeVideoId(url)

  if (!videoId) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">Invalid YouTube URL</p>
        <Button variant="outline" asChild>
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Open Original Video
          </a>
        </Button>
      </div>
    )
  }

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
  const embedUrl = `https://www.youtube.com/embed/${videoId}`

  return (
    <div className={`aspect-video rounded-lg overflow-hidden ${className}`}>
      {!isLoaded ? (
        <div 
          className="relative w-full h-full bg-muted cursor-pointer group"
          onClick={() => setIsLoaded(true)}
        >
          <img
            src={thumbnailUrl}
            alt="YouTube video thumbnail"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-all group-hover:bg-black/60">
            <div className="bg-red-600 rounded-full p-4 transition-transform group-hover:scale-110">
              <Play className="h-8 w-8 text-white fill-current" />
            </div>
          </div>
          <div className="absolute bottom-4 left-4 text-white">
            <p className="font-medium">Video Tutorial</p>
            <p className="text-sm opacity-90">Click to play</p>
          </div>
        </div>
      ) : (
        <iframe
          src={embedUrl}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      )}
    </div>
  )
}
```

**src/components/recipe/CategoryChip.tsx**
```typescript
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Category } from '@/lib/api'

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
```

**src/components/ui/theme-toggle.tsx**
```typescript
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/context/ThemeContext'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn('relative', className)}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

### 6. Pages

**src/pages/Home.tsx**
```typescript
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Sparkles } from 'lucide-react'
import { searchMeals, getCategories, filterByCategory, getRandomMeal } from '@/lib/api'
import { RecipeGrid } from '@/components/recipe/RecipeGrid'
import { CategoryChip } from '@/components/recipe/CategoryChip'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/EmptyState'

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
  const { data: randomMeal, refetch: refetchRandom } = useQuery({
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

export default Home
```

**src/pages/Details.tsx**
```typescript
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, MapPin, Clock, ExternalLink, Youtube } from 'lucide-react'
import { getMealById } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { IngredientList } from '@/components/recipe/IngredientList'
import { FavoriteButton } from '@/components/recipe/FavoriteButton'
import { YouTubeEmbed } from '@/components/recipe/YouTubeEmbed'
import { EmptyState } from '@/components/common/EmptyState'

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
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <div className="prose dark:prose-invert max-w-none">
            {meal.strInstructions?.split('\n').map((paragraph, index) => (
              paragraph.trim() && (
                <p key={index} className="mb-4 text-muted-foreground leading-relaxed">
                  {paragraph}
                </p>
              )
            ))}
          </div>
          
          {/* YouTube Video */}
          {meal.strYoutube && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Youtube className="h-5 w-5 text-red-500" />
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

export default Details
```

**src/pages/Favorites.tsx**
```typescript
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Trash2, SortAsc, Filter } from 'lucide-react'
import { useFavoritesManager, useClearFavorites } from '@/features/favorites/hooks'
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
import { SortOption } from '@/features/favorites/types'

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
        <RecipeGrid meals={[]} isLoading={true} />
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

export default Favorites
```

## Accessibility Features

### Keyboard Navigation
- All interactive elements focusable
- Skip link for main content
- Focus visible outlines
- Tab order logical

### ARIA Labels
- Landmark roles (main, nav, search)
- Button labels
- Image alt text
- List roles
- Dialog labels

### Screen Reader Support
- Semantic HTML (article, section, nav)
- Descriptive link text
- Status announcements
- Error messages

### Color Contrast
- WCAG AA compliant
- Dark mode support
- High contrast focus states

## Responsive Design

### Breakpoints
- Mobile: < 640px (1 column)
- Tablet: 640px - 1024px (2 columns)
- Desktop: 1024px - 1280px (3 columns)
- Large: > 1280px (4 columns)

### Mobile-First Approach
- Base styles for mobile
- Progressive enhancement
- Touch-friendly targets (44px min)
- Collapsible navigation

## Next Steps

1. Review this UI components plan
2. Proceed to:
   - `06-testing-deployment.md` - Testing and deployment guide
