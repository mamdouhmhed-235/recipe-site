import { Link, useLocation } from 'react-router-dom'
import { Heart, Menu, X } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { SearchBar } from '@/components/common/SearchBar'
import { useFavoritesCount } from '@/features/favorites/hooks'
import { useScrollDirection } from '@/hooks'
import { cn } from '@/lib/utils'

export function Header() {
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const { data: favoritesCount = 0 } = useFavoritesCount()
  const scrollDirection = useScrollDirection(10)
  
  const isActive = (path: string) => location.pathname === path

  // Handle scroll direction changes
  useEffect(() => {
    if (scrollDirection === 'down') {
      setIsVisible(false)
      // Close mobile menu when hiding header
      setIsMenuOpen(false)
    } else if (scrollDirection === 'up' || scrollDirection === null) {
      setIsVisible(true)
    }
  }, [scrollDirection])

  // Show header on click anywhere on the page
  useEffect(() => {
    const handleClick = () => {
      setIsVisible(true)
    }

    document.addEventListener('click', handleClick)

    return () => {
      document.removeEventListener('click', handleClick)
    }
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false)
    setIsVisible(true)
  }, [location.pathname])
  
  return (
    <header 
      className={cn(
        'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        'transition-transform duration-300 ease-in-out',
        !isVisible && '-translate-y-full'
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center space-x-2"
          aria-label="Recipes PWA Home"
        >
          <span className="text-2xl">🍳</span>
          <span className="font-bold text-xl">Recipes</span>
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
            onClick={(e) => {
              e.stopPropagation()
              setIsMenuOpen(!isMenuOpen)
            }}
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
