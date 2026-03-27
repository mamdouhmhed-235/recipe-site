# Testing & Deployment Plan

## Overview
Comprehensive testing strategy and deployment guide for the Recipes PWA.

## Testing Strategy

### 1. Unit Testing

**Testing Framework**: Vitest + React Testing Library

**Setup**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**vitest.config.ts**
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/setup.ts']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

**src/test/setup.ts**
```typescript
import '@testing-library/jest-dom'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock IndexedDB
import 'fake-indexeddb/auto'

// Mock service worker
Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    register: vi.fn(),
    ready: Promise.resolve({
      unregister: vi.fn()
    })
  },
  writable: true
})

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})
```

**Example Test: RecipeCard.test.tsx**
```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RecipeCard } from '@/components/recipe/RecipeCard'

const mockMeal = {
  idMeal: '52772',
  strMeal: 'Teriyaki Chicken Casserole',
  strMealThumb: 'https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg',
  strCategory: 'Chicken',
  strArea: 'Japanese'
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
  
  it('renders category badge', () => {
    renderWithProviders(<RecipeCard meal={mockMeal} />)
    expect(screen.getByText('Chicken')).toBeInTheDocument()
  })
  
  it('links to meal details', () => {
    renderWithProviders(<RecipeCard meal={mockMeal} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/meal/52772')
  })
  
  it('has accessible favorite button', () => {
    renderWithProviders(<RecipeCard meal={mockMeal} />)
    const button = screen.getByRole('button', { name: /favorite/i })
    expect(button).toHaveAttribute('aria-label')
  })
})
```

### 2. Integration Testing

**Example Test: Favorites Flow**
```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Favorites } from '@/pages/Favorites'
import { clearAllFavorites, saveFavorite } from '@/features/favorites/db'

const mockMeal = {
  idMeal: '52772',
  strMeal: 'Test Meal',
  strMealThumb: 'https://example.com/image.jpg',
  strCategory: 'Test Category',
  strArea: 'Test Area',
  strInstructions: 'Test instructions'
}

describe('Favorites Page', () => {
  let queryClient: QueryClient
  
  beforeEach(async () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false }
      }
    })
    await clearAllFavorites()
  })
  
  it('shows empty state when no favorites', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Favorites />
        </BrowserRouter>
      </QueryClientProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByText('No favorites yet')).toBeInTheDocument()
    })
  })
  
  it('displays saved favorites', async () => {
    await saveFavorite(mockMeal)
    
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Favorites />
        </BrowserRouter>
      </QueryClientProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Test Meal')).toBeInTheDocument()
    })
  })
  
  it('can search favorites', async () => {
    await saveFavorite(mockMeal)
    const user = userEvent.setup()
    
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Favorites />
        </BrowserRouter>
      </QueryClientProvider>
    )
    
    const searchInput = screen.getByPlaceholderText('Search favorites...')
    await user.type(searchInput, 'Test')
    
    await waitFor(() => {
      expect(screen.getByText('Test Meal')).toBeInTheDocument()
    })
  })
})
```

### 3. E2E Testing

**Testing Framework**: Playwright

**Setup**
```bash
npm install -D @playwright/test
npx playwright install
```

**playwright.config.ts**
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] }
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI
  }
})
```

**e2e/favorites.spec.ts**
```typescript
import { test, expect } from '@playwright/test'

test.describe('Favorites', () => {
  test.beforeEach(async ({ page }) => {
    // Clear IndexedDB before each test
    await page.goto('/')
    await page.evaluate(() => {
      return indexedDB.deleteDatabase('recipes-pwa')
    })
  })
  
  test('can add and view favorites', async ({ page }) => {
    // Navigate to home
    await page.goto('/')
    
    // Wait for recipes to load
    await page.waitForSelector('[role="listitem"]')
    
    // Click first recipe
    const firstRecipe = page.locator('[role="listitem"]').first()
    await firstRecipe.click()
    
    // Click favorite button
    const favoriteButton = page.locator('[aria-label*="favorite"]')
    await favoriteButton.click()
    
    // Navigate to favorites
    await page.goto('/favorites')
    
    // Verify recipe appears in favorites
    await expect(page.locator('[role="listitem"]')).toHaveCount(1)
  })
  
  test('favorites work offline', async ({ page, context }) => {
    // Add a favorite while online
    await page.goto('/')
    await page.waitForSelector('[role="listitem"]')
    const firstRecipe = page.locator('[role="listitem"]').first()
    await firstRecipe.click()
    await page.locator('[aria-label*="favorite"]').click()
    
    // Go offline
    await context.setOffline(true)
    
    // Navigate to favorites
    await page.goto('/favorites')
    
    // Verify favorite is still visible
    await expect(page.locator('[role="listitem"]')).toHaveCount(1)
  })
})
```

### 4. Accessibility Testing

**Tools**: axe-core, Lighthouse

**Automated Accessibility Test**
```typescript
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility', () => {
  test('home page has no accessibility violations', async ({ page }) => {
    await page.goto('/')
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    expect(accessibilityScanResults.violations).toEqual([])
  })
  
  test('details page has no accessibility violations', async ({ page }) => {
    await page.goto('/meal/52772')
    await page.waitForSelector('article')
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    expect(accessibilityScanResults.violations).toEqual([])
  })
  
  test('favorites page has no accessibility violations', async ({ page }) => {
    await page.goto('/favorites')
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    expect(accessibilityScanResults.violations).toEqual([])
  })
})
```

### 5. PWA Testing

**Manual PWA Checklist**
- [ ] App installs correctly
- [ ] App works offline
- [ ] Service worker updates properly
- [ ] Manifest is valid
- [ ] Icons display correctly
- [ ] App shortcuts work
- [ ] Offline fallback displays

**Automated PWA Test**
```typescript
import { test, expect } from '@playwright/test'

test.describe('PWA', () => {
  test('manifest is valid', async ({ page }) => {
    await page.goto('/')
    
    const manifestLink = page.locator('link[rel="manifest"]')
    await expect(manifestLink).toHaveAttribute('href', '/manifest.webmanifest')
    
    const response = await page.request.get('/manifest.webmanifest')
    const manifest = await response.json()
    
    expect(manifest.name).toBeDefined()
    expect(manifest.short_name).toBeDefined()
    expect(manifest.icons).toHaveLength(3)
    expect(manifest.start_url).toBe('/')
    expect(manifest.display).toBe('standalone')
  })
  
  test('service worker registers', async ({ page }) => {
    await page.goto('/')
    
    const swRegistration = await page.evaluate(() => {
      return navigator.serviceWorker.ready
    })
    
    expect(swRegistration).toBeDefined()
  })
  
  test('offline page loads', async ({ page, context }) => {
    await page.goto('/')
    
    // Go offline
    await context.setOffline(true)
    
    // Try to navigate to a new page
    await page.goto('/favorites')
    
    // Should show offline fallback or cached content
    const content = await page.content()
    expect(content).toContain('offline' || 'Favorites')
  })
})
```

## Deployment Guide

> **Note:** This project is designed for Vercel deployment. The backend API is implemented as Vercel Serverless Functions for a unified deployment experience.

### 1. Project Structure for Vercel

```
recipes-pwa/
├── api/                        # Vercel Serverless Functions
│   ├── meals/
│   │   ├── search.ts
│   │   ├── [id].ts
│   │   ├── categories.ts
│   │   ├── filter.ts
│   │   └── random.ts
│   └── health.ts
├── src/                       # React frontend
│   ├── components/
│   ├── pages/
│   ├── features/
│   ├── lib/
│   └── ...
├── public/
│   ├── sw.js
│   ├── manifest.webmanifest
│   └── icons/
├── vercel.json
└── package.json
```

### 2. Vercel Configuration

**vercel.json**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs20.x"
    }
  },
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/sw.js",
      "headers": [
        { "key": "Cache-Control", "value": "no-cache" }
      ]
    },
    {
      "source": "/manifest.webmanifest",
      "headers": [
        { "key": "Cache-Control", "value": "no-cache" }
      ]
    }
  ]
}
```

### 3. API Routes as Serverless Functions

**api/meals/search.ts**
```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node'

const MEALDB_API_BASE = process.env.MEALDB_API_BASE || 'https://www.themealdb.com/api/json/v1'
const MEALDB_API_KEY = process.env.MEALDB_API_KEY || '1'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const query = req.query.s as string
  
  if (!query || query.trim().length === 0) {
    return res.status(400).json({ error: 'Search query is required' })
  }
  
  try {
    const sanitizedQuery = encodeURIComponent(query.trim())
    const response = await fetch(`${MEALDB_API_BASE}/${MEALDB_API_KEY}/search.php?s=${sanitizedQuery}`)
    const data = await response.json()
    
    res.json({
      meals: data.meals || [],
      query: query.trim()
    })
  } catch (error) {
    console.error('Search error:', error)
    res.status(500).json({
      error: 'Failed to search meals',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
```

**api/meals/[id].ts**
```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node'

const MEALDB_API_BASE = process.env.MEALDB_API_BASE || 'https://www.themealdb.com/api/json/v1'
const MEALDB_API_KEY = process.env.MEALDB_API_KEY || '1'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query
  
  if (!id || !/^\d+$/.test(id as string)) {
    return res.status(400).json({ error: 'Valid meal ID is required' })
  }
  
  try {
    const response = await fetch(`${MEALDB_API_BASE}/${MEALDB_API_KEY}/lookup.php?i=${id}`)
    const data = await response.json()
    
    if (!data.meals || data.meals.length === 0) {
      return res.status(404).json({ error: 'Meal not found' })
    }
    
    const meal = data.meals[0]
    const ingredients: Array<{ ingredient: string; measure: string }> = []
    
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`]
      const measure = meal[`strMeasure${i}`]
      
      if (ingredient && ingredient.trim()) {
        ingredients.push({
          ingredient: ingredient.trim(),
          measure: measure?.trim() || ''
        })
      }
    }
    
    res.json({
      ...meal,
      ingredients
    })
  } catch (error) {
    console.error('Meal lookup error:', error)
    res.status(500).json({
      error: 'Failed to fetch meal details',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
```

**api/categories.ts**
```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node'

const MEALDB_API_BASE = process.env.MEALDB_API_BASE || 'https://www.themealdb.com/api/json/v1'
const MEALDB_API_KEY = process.env.MEALDB_API_KEY || '1'

// Simple in-memory cache
let cachedCategories: any = null
let cacheTime = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Check cache
  const now = Date.now()
  if (cachedCategories && (now - cacheTime) < CACHE_TTL) {
    return res.json({ categories: cachedCategories, cached: true })
  }
  
  try {
    const response = await fetch(`${MEALDB_API_BASE}/${MEALDB_API_KEY}/categories.php`)
    const data = await response.json()
    
    cachedCategories = data.categories || []
    cacheTime = now
    
    res.json({
      categories: cachedCategories,
      cached: false
    })
  } catch (error) {
    console.error('Categories error:', error)
    res.status(500).json({
      error: 'Failed to fetch categories',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
```

**api/filter.ts**
```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node'

const MEALDB_API_BASE = process.env.MEALDB_API_BASE || 'https://www.themealdb.com/api/json/v1'
const MEALDB_API_KEY = process.env.MEALDB_API_KEY || '1'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const category = req.query.c as string
  
  if (!category || category.trim().length === 0) {
    return res.status(400).json({ error: 'Category is required' })
  }
  
  try {
    const sanitizedCategory = encodeURIComponent(category.trim())
    const response = await fetch(`${MEALDB_API_BASE}/${MEALDB_API_KEY}/filter.php?c=${sanitizedCategory}`)
    const data = await response.json()
    
    res.json({
      meals: data.meals || [],
      category: category.trim()
    })
  } catch (error) {
    console.error('Filter error:', error)
    res.status(500).json({
      error: 'Failed to filter meals',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
```

**api/random.ts**
```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node'

const MEALDB_API_BASE = process.env.MEALDB_API_BASE || 'https://www.themealdb.com/api/json/v1'
const MEALDB_API_KEY = process.env.MEALDB_API_KEY || '1'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const response = await fetch(`${MEALDB_API_BASE}/${MEALDB_API_KEY}/random.php`)
    const data = await response.json()
    
    if (!data.meals || data.meals.length === 0) {
      return res.status(404).json({ error: 'No random meal found' })
    }
    
    res.json(data.meals[0])
  } catch (error) {
    console.error('Random meal error:', error)
    res.status(500).json({
      error: 'Failed to fetch random meal',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
```

**api/health.ts**
```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
}
```

### 4. Environment Variables

Set these in Vercel dashboard:
- `MEALDB_API_BASE`: `https://www.themealdb.com/api/json/v1`
- `MEALDB_API_KEY`: Your API key (or `1` for development)

### 5. Deployment Steps

1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### 6. Benefits of Vercel Deployment

- **Single deployment**: Frontend and API together
- **Automatic HTTPS**: SSL certificates managed
- **Edge caching**: Fast global delivery
- **Serverless functions**: Auto-scaling API
- **Preview deployments**: Test before merging
- **Analytics**: Built-in performance monitoring

## Performance Optimization

### 1. Build Optimization

**vite.config.ts** (production)
```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: true
  }
})
```

### 2. Image Optimization

- Use WebP format with fallbacks
- Lazy load images
- Responsive images with srcset
- CDN for TheMealDB images

### 3. Caching Strategy

| Resource | Strategy | Duration |
|----------|----------|----------|
| HTML | Network-First | - |
| JS/CSS | Cache-First | 1 year |
| Images | Stale-While-Revalidate | 7 days |
| API | Network-First | 5 min |
| Fonts | Cache-First | 1 year |

## Monitoring & Analytics

### 1. Error Tracking

**Sentry Integration**
```typescript
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0
})
```

### 2. Performance Monitoring

**Web Vitals**
```typescript
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals'

function sendToAnalytics(metric) {
  const body = JSON.stringify(metric)
  navigator.sendBeacon('/analytics', body)
}

onCLS(sendToAnalytics)
onFID(sendToAnalytics)
onFCP(sendToAnalytics)
onLCP(sendToAnalytics)
onTTFB(sendToAnalytics)
```

## Security Checklist

- [ ] API key never exposed to client
- [ ] CORS configured correctly
- [ ] Helmet security headers enabled
- [ ] Input validation on all endpoints
- [ ] HTTPS enforced in production
- [ ] Content Security Policy configured
- [ ] Dependencies regularly updated
- [ ] No sensitive data in logs

## Launch Checklist

### Pre-Launch
- [ ] All tests passing
- [ ] Accessibility audit complete
- [ ] Performance audit complete
- [ ] Security audit complete
- [ ] PWA audit complete
- [ ] Cross-browser testing done
- [ ] Mobile testing done
- [ ] Offline functionality verified

### Launch
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Environment variables set
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] CDN configured
- [ ] Monitoring active

### Post-Launch
- [ ] Error tracking active
- [ ] Performance monitoring active
- [ ] User feedback collection
- [ ] Analytics tracking
- [ ] Backup strategy in place
- [ ] Rollback plan documented

## Maintenance

### Regular Tasks
- Weekly dependency updates
- Monthly security audits
- Quarterly performance reviews
- Annual accessibility audit

### Monitoring
- Error rates
- Performance metrics
- User engagement
- PWA install rate
- Offline usage patterns

## Next Steps

1. Review all implementation plans
2. Begin implementation following the plans
3. Test thoroughly at each stage
4. Deploy to staging environment
5. Perform final QA
6. Deploy to production
7. Monitor and iterate
