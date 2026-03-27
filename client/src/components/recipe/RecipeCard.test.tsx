import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RecipeCard } from '@/components/recipe/RecipeCard'
import type { Meal } from '@/lib/api'

// Mock FavoriteButton since it depends on IndexedDB
vi.mock('@/components/recipe/FavoriteButton', () => ({
  FavoriteButton: () => (
    <button aria-label="Add to favorites">♥</button>
  )
}))

const mockMeal: Meal = {
  idMeal: '52772',
  strMeal: 'Teriyaki Chicken Casserole',
  strMealThumb: 'https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg',
  strCategory: 'Chicken',
  strArea: 'Japanese',
  strInstructions: 'Test instructions for the recipe',
  strDrinkAlternate: null,
  strTags: null,
  strYoutube: null,
  strSource: null,
  strImageSource: null,
  strCreativeCommonsConfirmed: null,
  dateModified: null
}

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false }
    }
  })
  
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('RecipeCard', () => {
  it('renders meal name', () => {
    renderWithProviders(<RecipeCard meal={mockMeal} />)
    expect(screen.getByText('Teriyaki Chicken Casserole')).toBeInTheDocument()
  })
  
  it('renders meal image with alt text', () => {
    renderWithProviders(<RecipeCard meal={mockMeal} />)
    const img = screen.getByAltText('Teriyaki Chicken Casserole')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', mockMeal.strMealThumb)
  })
  
  it('renders category badge when meal has category', () => {
    renderWithProviders(<RecipeCard meal={mockMeal} />)
    // Category appears twice: once in badge, once in content area
    const categoryElements = screen.getAllByText('Chicken')
    expect(categoryElements.length).toBeGreaterThanOrEqual(1)
  })
  
  it('links to meal details', () => {
    renderWithProviders(<RecipeCard meal={mockMeal} />)
    const links = screen.getAllByRole('link')
    const detailLink = links.find(link => link.getAttribute('href') === `/meal/${mockMeal.idMeal}`)
    expect(detailLink).toBeTruthy()
  })
  
  it('has accessible favorite button', () => {
    renderWithProviders(<RecipeCard meal={mockMeal} />)
    const button = screen.getByRole('button', { name: /favorite/i })
    expect(button).toHaveAttribute('aria-label')
  })
  
  it('renders area information', () => {
    renderWithProviders(<RecipeCard meal={mockMeal} />)
    expect(screen.getByText('Japanese')).toBeInTheDocument()
  })
  
  it('renders View Recipe button', () => {
    renderWithProviders(<RecipeCard meal={mockMeal} />)
    expect(screen.getByText('View Recipe')).toBeInTheDocument()
  })
})
