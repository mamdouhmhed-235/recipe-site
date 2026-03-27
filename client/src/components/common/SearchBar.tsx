import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface SearchBarProps {
  placeholder?: string
  className?: string
}

export function SearchBar({
  placeholder = 'Search recipes...',
  className
}: SearchBarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  
  // Use URL as the source of truth for the initial value
  const urlQuery = useMemo(() => searchParams.get('q') || '', [searchParams])
  const [value, setValue] = useState(urlQuery)
  const isFirstRender = useRef(true)
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  
  // Debounced search - only navigate when user is actively typing on home page
  useEffect(() => {
    // Skip the first render to prevent automatic navigation
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    
    // Clear any existing timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current)
    }
    
    // Set new timeout for debounced search
    debounceTimeout.current = setTimeout(() => {
      // Only navigate if we're on the home page or search results page
      if (location.pathname === '/') {
        if (value.trim()) {
          navigate(`/?q=${encodeURIComponent(value.trim())}`)
        } else {
          navigate('/')
        }
      }
    }, 300)
    
    // Cleanup on unmount or before next effect
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current)
      }
    }
  }, [value, navigate, location.pathname])
  
  // Sync value with URL changes (using a ref to track previous value)
  const prevUrlQuery = useRef(urlQuery)
  useEffect(() => {
    if (urlQuery !== prevUrlQuery.current && urlQuery !== value && location.pathname === '/') {
      // Update local state only when URL changed externally
      setValue(urlQuery)
    }
    prevUrlQuery.current = urlQuery
  }, [urlQuery, location.pathname, value])
  
  const handleClear = () => {
    setValue('')
    // Only navigate to home if not already there
    if (location.pathname !== '/') {
      navigate('/')
    }
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
