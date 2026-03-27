# Frontend Setup Plan

## Overview
React + Vite frontend with Tailwind CSS, shadcn/ui components, and TanStack Query for data fetching.

## File Structure
```
/client
  index.html
  package.json
  vite.config.ts
  tsconfig.json
  tsconfig.node.json
  postcss.config.cjs
  tailwind.config.cjs
  components.json           → shadcn/ui config
  src/
    main.tsx               → App entry point
    App.tsx                → Main app component with routing
    vite-env.d.ts          → Vite type declarations
    styles/
      globals.css          → Tailwind + custom styles
    components/
      ui/                  → shadcn/ui components
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
      layout/
        Header.tsx
        Layout.tsx
      recipe/
        RecipeCard.tsx
        RecipeGrid.tsx
        CategoryChip.tsx
        IngredientList.tsx
      common/
        ErrorBoundary.tsx
        EmptyState.tsx
        LoadingSpinner.tsx
    pages/
      Home.tsx
      Details.tsx
      Favorites.tsx
    features/
      favorites/
        db.ts              → IndexedDB helpers
        hooks.ts           → React hooks for favorites
      search/
        hooks.ts           → Search logic
    lib/
      api.ts               → API client
      queryClient.ts       → TanStack Query config
      utils.ts             → Utility functions
    hooks/
      useOnlineStatus.ts   → Online/offline detection
      useMediaQuery.ts     → Responsive breakpoints
    context/
      ThemeContext.tsx      → Dark/light mode
```

## Step-by-Step Implementation

### 1. Initialize Vite Project
```bash
npm create vite@latest client -- --template react-ts
cd client
```

### 2. Install Dependencies
```bash
# Core
npm install react-router-dom @tanstack/react-query

# UI
npm install tailwindcss postcss autoprefixer
npm install class-variance-authority clsx tailwind-merge lucide-react

# shadcn/ui dependencies
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-label @radix-ui/react-slot
npm install @radix-ui/react-toast @radix-ui/react-tooltip
npm install @radix-ui/react-separator @radix-ui/react-scroll-area
npm install @radix-ui/react-select

# Utilities
npm install idb sonner

# Dev dependencies
npm install -D @types/react @types/react-dom tailwindcss-animate
```

### 3. Tailwind Configuration

**tailwind.config.cjs**
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

**postcss.config.cjs**
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### 4. Global Styles

**src/styles/globals.css**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  @apply bg-muted;
}

::-webkit-scrollbar-thumb {
  @apply bg-muted-foreground/30 rounded-full;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-muted-foreground/50;
}

/* Focus visible outline for accessibility */
:focus-visible {
  @apply outline-none ring-2 ring-ring ring-offset-2 ring-offset-background;
}

/* Skip link for accessibility */
.skip-link {
  @apply sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md;
}

/* Offline toast animation */
@keyframes slide-in {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.offline-toast {
  animation: slide-in 0.3s ease-out;
}
```

### 5. shadcn/ui Configuration

**components.json**
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.cjs",
    "css": "src/styles/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

### 6. Vite Configuration

**vite.config.ts**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react()
    // Note: PWA is handled by manual service worker in public/sw.js
    // We do NOT use vite-plugin-pwa or Workbox for full control over caching strategies
    // See 03-pwa-service-worker.md for the manual implementation
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5174',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
```

### 7. Package.json Scripts

**package.json** (relevant scripts)
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

### 8. TypeScript Configuration

**tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**tsconfig.node.json**
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

### 9. Utility Functions

**src/lib/utils.ts**
```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge Tailwind classes with conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format date string
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

/**
 * Extract YouTube video ID from URL
 */
export function getYouTubeVideoId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  return match ? match[1] : null
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
```

### 10. API Client

**src/lib/api.ts**
```typescript
const API_BASE = '/api'

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `API error: ${response.status}`)
  }
  
  return response.json()
}

/**
 * Search meals by name
 */
export async function searchMeals(query: string) {
  return fetchAPI<{ meals: Meal[]; query: string }>(`/search?s=${encodeURIComponent(query)}`)
}

/**
 * Get meal details by ID
 */
export async function getMealById(id: string) {
  return fetchAPI<Meal>(`/meal/${id}`)
}

/**
 * Get all categories
 */
export async function getCategories() {
  return fetchAPI<{ categories: Category[] }>('/categories')
}

/**
 * Filter meals by category
 */
export async function filterByCategory(category: string) {
  return fetchAPI<{ meals: MealSummary[]; category: string }>(`/filter?c=${encodeURIComponent(category)}`)
}

/**
 * Get random meal
 */
export async function getRandomMeal() {
  return fetchAPI<Meal>('/random')
}

// Type definitions (re-export from server types)
export interface Meal {
  idMeal: string
  strMeal: string
  strDrinkAlternate: string | null
  strCategory: string
  strArea: string
  strInstructions: string
  strMealThumb: string
  strTags: string | null
  strYoutube: string | null
  strIngredient1?: string
  strIngredient2?: string
  strIngredient3?: string
  strIngredient4?: string
  strIngredient5?: string
  strIngredient6?: string
  strIngredient7?: string
  strIngredient8?: string
  strIngredient9?: string
  strIngredient10?: string
  strIngredient11?: string
  strIngredient12?: string
  strIngredient13?: string
  strIngredient14?: string
  strIngredient15?: string
  strIngredient16?: string
  strIngredient17?: string
  strIngredient18?: string
  strIngredient19?: string
  strIngredient20?: string
  strMeasure1?: string
  strMeasure2?: string
  strMeasure3?: string
  strMeasure4?: string
  strMeasure5?: string
  strMeasure6?: string
  strMeasure7?: string
  strMeasure8?: string
  strMeasure9?: string
  strMeasure10?: string
  strMeasure11?: string
  strMeasure12?: string
  strMeasure13?: string
  strMeasure14?: string
  strMeasure15?: string
  strMeasure16?: string
  strMeasure17?: string
  strMeasure18?: string
  strMeasure19?: string
  strMeasure20?: string
  strSource: string | null
  strImageSource: string | null
  strCreativeCommonsConfirmed: string | null
  dateModified: string | null
  ingredients?: Array<{ ingredient: string; measure: string }>
}

export interface Category {
  idCategory: string
  strCategory: string
  strCategoryThumb: string
  strCategoryDescription: string
}

export interface MealSummary {
  strMeal: string
  strMealThumb: string
  idMeal: string
}
```

### 11. Query Client Configuration

**src/lib/queryClient.ts**
```typescript
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry failed requests 3 times
      retry: 3,
      // Retry delay increases exponentially
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus (good for PWA)
      refetchOnWindowFocus: true,
      // Stale time: 5 minutes
      staleTime: 5 * 60 * 1000,
      // Cache time: 10 minutes
      gcTime: 10 * 60 * 1000,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
})
```

### 12. Main Entry Point

**src/main.tsx**
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import App from './App'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('SW registered:', registration.scope)
      },
      (error) => {
        console.log('SW registration failed:', error)
      }
    )
  })
}
```

### 13. App Component with Routing

**src/App.tsx**
```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Details from './pages/Details'
import Favorites from './pages/Favorites'
import ErrorBoundary from './components/common/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/meal/:id" element={<Details />} />
              <Route path="/favorites" element={<Favorites />} />
            </Routes>
          </Layout>
          <Toaster position="bottom-right" richColors />
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
```

### 14. State Management Architecture (Simplified)

**Recommended Architecture:**
- **Server State:** TanStack Query (for all API data)
- **Local State:** React useState/useReducer (for UI state)
- **URL State:** React Router search params (for shareable state)
- **Persistent State:** IndexedDB via custom hooks (for favorites)

> **Note:** We intentionally avoid Zustand or other global state libraries. React Query handles server state, and local useState is sufficient for UI state. This keeps the bundle smaller and the architecture simpler.

**State Management Pattern:**

```typescript
// Server State - Use TanStack Query
const { data: meals } = useQuery({ queryKey: ['meals'], queryFn: fetchMeals })

// Local UI State - Use useState
const [searchQuery, setSearchQuery] = useState('')
const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

// URL State - Use searchParams for shareable state
const [searchParams, setSearchParams] = useSearchParams()
const query = searchParams.get('q') || ''

// Persistent State - Use IndexedDB hooks
const { favorites, addFavorite, removeFavorite } = useFavorites()
```

**When to Use Each:**

| State Type | Solution | Example |
|------------|----------|---------|
| API Data | TanStack Query | meals, categories |
| Form Input | Local useState | search query, selected filters |
| Shareable State | URL Search Params | `?q=pasta&c=Italian` |
| Offline Data | IndexedDB + Hooks | favorites |
| Theme | LocalStorage + Context | dark/light mode |

**Best Practices:**
1. **Keep state as local as possible** - Only lift state when needed
2. **Use URL for shareable state** - Search queries, filters should be in URL
3. **Let React Query manage server state** - Don't duplicate in local state
4. **Persist only what's needed offline** - Favorites go to IndexedDB

### 15. CSS Best Practices (Well-Supported Features)

This section focuses on CSS features with broad browser support for production use.

**CSS Custom Properties (CSS Variables):**
```css
/* Theme variables - well supported everywhere */
:root {
  --color-primary: #3b82f6;
  --color-secondary: #64748b;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --radius: 0.5rem;
  --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

/* Usage */
.card {
  background: var(--color-background);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}
```

**Flexbox and Grid (Fully Supported):**
```css
/* Responsive grid without media queries */
.recipe-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

/* Flexbox for alignment */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
```

**CSS Transitions and Animations:**
```css
/* Smooth transitions */
.card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

/* Keyframe animations */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fade-in 0.3s ease-out;
}
```

**Focus States for Accessibility:**
```css
/* Visible focus for keyboard navigation */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Skip link for screen readers */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  padding: 8px 16px;
  background: var(--color-primary);
  color: white;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

**Responsive Design with Media Queries:**
```css
/* Mobile-first approach */
.container {
  padding: 1rem;
}

@media (min-width: 640px) {
  .container {
    padding: 2rem;
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 3rem;
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

**Dark Mode Support:**
```css
/* Using Tailwind's dark mode with CSS variables */
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
}
```

**Implementation Recommendations:**
1. Use CSS custom properties for theming and consistency
2. Use CSS Grid for layouts - fully supported since 2017
3. Add smooth transitions for interactive elements
4. Ensure visible focus states for accessibility
5. Use mobile-first media queries
6. Support dark mode via CSS variables and Tailwind

## Next Steps

1. Review this frontend setup plan
2. Proceed to:
   - `03-pwa-service-worker.md` - PWA implementation details
   - `04-indexeddb-offline.md` - Offline favorites storage
   - `05-ui-components-pages.md` - Component and page implementations
