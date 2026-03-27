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