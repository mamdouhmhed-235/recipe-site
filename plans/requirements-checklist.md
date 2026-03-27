# Requirements Verification Checklist

> **Purpose**: This checklist extracts all requirements from the plan files to verify against the actual codebase implementation.
> 
> **Generated**: 2026-03-27
> 
> **Scope**: Requirements extracted from all plan files in `/plans` directory.

---

## Table of Contents

1. [README.md - Project Overview](#1-readmemd---project-overview)
2. [00-architecture-overview.md](#2-00-architecture-overviewmd)
3. [01-backend-implementation.md](#3-01-backend-implementationmd)
4. [02-frontend-setup.md](#4-02-frontend-setupmd)
5. [03-pwa-service-worker.md](#5-03-pwa-service-workermd)
6. [04-indexeddb-offline.md](#6-04-indexeddb-offlinemd)
7. [05-ui-components-pages.md](#7-05-ui-components-pagesmd)
8. [06-testing-deployment.md](#8-06-testing-deploymentmd)
9. [07-review-findings.md](#9-07-review-findingsmd)

---

## 1. README.md - Project Overview

### Core Functionality Requirements
- [ ] Search recipes by name
- [ ] Browse categories
- [ ] View recipe details
- [ ] Save favorites
- [ ] Offline access to favorites

### PWA Features
- [ ] Installable app
- [ ] Offline support
- [ ] Service worker caching
- [ ] App manifest
- [ ] Background sync (future enhancement)

### UI/UX Requirements
- [ ] Responsive design
- [ ] Dark/light theme toggle
- [ ] Skeleton loaders for loading states
- [ ] Toast notifications
- [ ] Error boundaries
- [ ] Empty states

### Accessibility Requirements
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] ARIA labels
- [ ] Focus management
- [ ] Color contrast (WCAG AA)

### Performance Requirements
- [ ] Code splitting
- [ ] Image optimization
- [ ] Caching strategies
- [ ] Lazy loading
- [ ] Bundle optimization

### API Endpoints Required
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/search?s={query}` | GET | Search meals by name |
| `/api/meal/:id` | GET | Get meal details |
| `/api/categories` | GET | List all categories |
| `/api/filter?c={category}` | GET | Filter by category |
| `/api/random` | GET | Get random meal |
| `/health` | GET | Health check |

### Caching Strategy Requirements
| Resource | Strategy | Duration |
|----------|----------|----------|
| App Shell | Cache-First | Until SW update |
| API Data | Network-First | 5 minutes |
| Images | Stale-While-Revalidate | 7 days |
| Static Assets | Cache-First | 1 year |

### Success Criteria
- [ ] App runs locally with server and client concurrently
- [ ] Client uses only `/api/*` endpoints
- [ ] Favorites work offline (add/view/remove) using IndexedDB
- [ ] PWA is installable and precaches app shell
- [ ] Search, categories, and detail views all functional
- [ ] Skeletons and error states implemented
- [ ] No API key exposure — server reads `MEALDB_API_KEY` (default 1)

---

## 2. 00-architecture-overview.md

### System Architecture Requirements

#### Client Layer
- [ ] React 18 with Vite
- [ ] TanStack Query for server state
- [ ] Service Worker for caching
- [ ] IndexedDB for offline storage

#### Server Layer
- [ ] Node.js + Express
- [ ] CORS middleware
- [ ] Helmet security headers
- [ ] Compression middleware
- [ ] In-memory TTL cache

#### External API
- [ ] TheMealDB API integration
- [ ] API key hidden server-side

### Data Flow Requirements

#### Search Flow
- [ ] User Input → Search Component → API Client → `/api/search`
- [ ] Express Proxy → TheMealDB → Response → Cache → UI Update

#### Favorites Flow (Online)
- [ ] Click Favorite → IndexedDB Save → UI Update → Toast

#### Favorites Flow (Offline)
- [ ] App Load → Service Worker Check → Offline Mode
- [ ] IndexedDB Load → Display Cached Favorites

### Design Decisions
- [ ] API Proxy Pattern implemented (hide API key, enable caching)
- [ ] IndexedDB for favorites (persistent, offline-capable)
- [ ] Service Worker strategies:
  - Network-First for API
  - Stale-While-Revalidate for images
  - Cache-First for shell

### Security Requirements
- [ ] API Key Protection (never exposed to client)
- [ ] CORS restricted to client origin in production
- [ ] Helmet security headers (XSS, CSRF, etc.)
- [ ] Input validation (sanitize search queries)
- [ ] Rate limiting consideration for production
- [ ] HTTPS required for PWA

### Performance Targets
- [ ] First Contentful Paint: < 1.5s
- [ ] Time to Interactive: < 3s
- [ ] Offline Load: < 500ms (from cache)
- [ ] Lighthouse Score: 90+ (Performance, Accessibility, PWA)

---

## 3. 01-backend-implementation.md

### File Structure Requirements
```
/server
  .env.example
  .env
  package.json
  tsconfig.json
  src/
    index.ts          → Server entry point
    routes/
      mealdb.ts       → All /api/* routes
    middleware/
      cache.ts        → In-memory TTL cache
    types/
      index.ts        → TypeScript interfaces
```

### Environment Configuration
- [ ] `.env.example` file exists with:
  - `MEALDB_API_BASE=https://www.themealdb.com/api/json/v1`
  - `MEALDB_API_KEY=1`
  - `PORT=5174`
  - `CLIENT_ORIGIN=http://localhost:5173`
- [ ] `.env` file created from example

### TypeScript Configuration
- [ ] Target: ES2020
- [ ] Module: commonjs
- [ ] Strict mode enabled
- [ ] ES module interop enabled
- [ ] Source maps generated
- [ ] Output to `./dist`

### Package.json Scripts
- [ ] `dev`: ts-node-dev with respawn
- [ ] `build`: tsc compilation
- [ ] `start`: node dist/index.js

### Type Definitions Required
**File**: `server/src/types/index.ts`
- [ ] `Meal` interface with all fields (idMeal, strMeal, strCategory, etc.)
- [ ] `Category` interface
- [ ] `MealSummary` interface
- [ ] `SearchResponse` interface
- [ ] `CategoriesResponse` interface
- [ ] `FilterResponse` interface
- [ ] `CacheEntry<T>` interface

### Caching Middleware Requirements
**File**: `server/src/middleware/cache.ts`
- [ ] In-memory cache store (Map)
- [ ] Default TTL: 60 seconds (1 minute)
- [ ] Categories TTL: 5 minutes
- [ ] `getFromCache(key)` function
- [ ] `setCache(key, data, ttl)` function
- [ ] `cacheMiddleware(ttl)` middleware function
- [ ] X-Cache header (HIT/MISS)
- [ ] `clearCache(key?)` function

### Server Entry Point Requirements
**File**: `server/src/index.ts`
- [ ] Express app initialization
- [ ] Helmet middleware (with CSP disabled for dev)
- [ ] CORS configuration (restricted to CLIENT_ORIGIN)
- [ ] Compression middleware
- [ ] JSON parsing
- [ ] Request logging (development)
- [ ] API routes mounted at `/api`
- [ ] Health check endpoint at `/health`
- [ ] 404 handler
- [ ] Error handler with environment-aware messages

### API Routes Requirements
**File**: `server/src/routes/mealdb.ts`

#### GET /api/search
- [ ] Query param: `s` (required)
- [ ] Input sanitization with `encodeURIComponent`
- [ ] Returns `{ meals: [], query: string }`
- [ ] 400 error for missing query
- [ ] 500 error for API failures

#### GET /api/meal/:id
- [ ] Param: `id` (required, numeric)
- [ ] Returns meal object with `ingredients` array
- [ ] Extracts ingredients/measures (1-20)
- [ ] 400 error for invalid ID
- [ ] 404 error for meal not found

#### GET /api/categories
- [ ] Uses cache middleware (5 min TTL)
- [ ] Returns `{ categories: [] }`
- [ ] 500 error for API failures

#### GET /api/filter
- [ ] Query param: `c` (required)
- [ ] Input sanitization
- [ ] Returns `{ meals: [], category: string }`
- [ ] 400 error for missing category

#### GET /api/random
- [ ] Returns single meal object
- [ ] 404 error if no meal found

### Error Handling Strategy
- [ ] Validation Errors: 400 with descriptive message
- [ ] Not Found: 404 for missing resources
- [ ] API Errors: 500 with error details (dev only)
- [ ] Network Errors: Caught and logged, generic message to client

### Security Measures
- [ ] Helmet security headers
- [ ] CORS restricted to client origin
- [ ] Input sanitization (encodeURIComponent)
- [ ] API key never exposed in responses
- [ ] Rate limiting consideration documented

### Testing Checklist (Backend)
- [ ] Server starts without errors
- [ ] All endpoints return correct data
- [ ] Caching works (X-Cache header)
- [ ] Error handling returns proper status codes
- [ ] CORS allows client requests
- [ ] API key not exposed in responses
- [ ] Health check endpoint works

---

## 4. 02-frontend-setup.md

### File Structure Requirements
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
    App.tsx                → Main app with routing
    vite-env.d.ts          → Vite type declarations
    styles/
      globals.css          → Tailwind + custom styles
    components/
      ui/                  → shadcn/ui components
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
        hooks.ts           → React hooks
    lib/
      api.ts               → API client
      queryClient.ts       → TanStack Query config
      utils.ts             → Utility functions
    context/
      ThemeContext.tsx     → Dark/light mode
```

### Dependencies Required
#### Core
- [ ] react-router-dom
- [ ] @tanstack/react-query

#### UI
- [ ] tailwindcss
- [ ] postcss
- [ ] autoprefixer
- [ ] class-variance-authority
- [ ] clsx
- [ ] tailwind-merge
- [ ] lucide-react

#### shadcn/ui Dependencies
- [ ] @radix-ui/react-dialog
- [ ] @radix-ui/react-dropdown-menu
- [ ] @radix-ui/react-label
- [ ] @radix-ui/react-slot
- [ ] @radix-ui/react-toast
- [ ] @radix-ui/react-tooltip
- [ ] @radix-ui/react-separator
- [ ] @radix-ui/react-scroll-area
- [ ] @radix-ui/react-select

#### Utilities
- [ ] idb (IndexedDB wrapper)
- [ ] sonner (toast notifications)

### Tailwind Configuration Requirements
**File**: `client/tailwind.config.cjs`
- [ ] Dark mode: "class"
- [ ] Content paths configured
- [ ] Container configuration (center, padding, 2xl screen)
- [ ] CSS variable-based color system
- [ ] Border radius variables
- [ ] Accordion animations
- [ ] tailwindcss-animate plugin

### PostCSS Configuration
**File**: `client/postcss.config.cjs`
- [ ] tailwindcss plugin
- [ ] autoprefixer plugin

### Global Styles Requirements
**File**: `client/src/styles/globals.css`
- [ ] Tailwind directives (base, components, utilities)
- [ ] CSS custom properties for light theme
- [ ] CSS custom properties for dark theme (`.dark` class)
- [ ] Custom scrollbar styles
- [ ] Focus visible outline for accessibility
- [ ] Skip link for accessibility
- [ ] Offline toast animation

### shadcn/ui Configuration
**File**: `client/components.json`
- [ ] Style: "default"
- [ ] RSC: false
- [ ] TSX: true
- [ ] Tailwind config path
- [ ] CSS path
- [ ] Base color: slate
- [ ] CSS variables: true
- [ ] Aliases configured (@/components, @/lib, etc.)

### Vite Configuration Requirements
**File**: `client/vite.config.ts`
- [ ] React plugin
- [ ] Path alias `@` → `./src`
- [ ] Server port: 5173
- [ ] API proxy to localhost:5174
- [ ] Build output: dist
- [ ] Sourcemaps enabled

### TypeScript Configuration
**File**: `client/tsconfig.json`
- [ ] Target: ES2020
- [ ] Module: ESNext
- [ ] Module resolution: bundler
- [ ] JSX: react-jsx
- [ ] Strict mode
- [ ] No unused locals/parameters
- [ ] Path aliases configured

### Utility Functions Required
**File**: `client/src/lib/utils.ts`
- [ ] `cn()` - class merge utility
- [ ] `formatDate()` - date formatting
- [ ] `truncateText()` - text truncation
- [ ] `getYouTubeVideoId()` - YouTube URL parsing
- [ ] `debounce()` - debounce function

### API Client Requirements
**File**: `client/src/lib/api.ts`
- [ ] API_BASE: `/api`
- [ ] `fetchAPI<T>()` - generic fetch wrapper with error handling
- [ ] `searchMeals(query)` function
- [ ] `getMealById(id)` function
- [ ] `getCategories()` function
- [ ] `filterByCategory(category)` function
- [ ] `getRandomMeal()` function
- [ ] Type definitions (Meal, Category, MealSummary)

### Query Client Configuration
**File**: `client/src/lib/queryClient.ts`
- [ ] Retry: 3 attempts
- [ ] Exponential retry delay
- [ ] Refetch on window focus
- [ ] Stale time: 5 minutes
- [ ] GC time: 10 minutes
- [ ] Mutation retry: 1

### Main Entry Point Requirements
**File**: `client/src/main.tsx`
- [ ] React 18 strict mode
- [ ] QueryClientProvider wrapper
- [ ] Global styles imported
- [ ] Service worker registration

### App Component Requirements
**File**: `client/src/App.tsx`
- [ ] BrowserRouter
- [ ] ThemeProvider
- [ ] Layout component
- [ ] Routes: `/`, `/meal/:id`, `/favorites`
- [ ] Toaster component (sonner)
- [ ] ErrorBoundary wrapper

### State Management Pattern
| State Type | Solution | Example |
|------------|----------|---------|
| API Data | TanStack Query | meals, categories |
| Form Input | Local useState | search query, filters |
| Shareable State | URL Search Params | `?q=pasta&c=Italian` |
| Offline Data | IndexedDB + Hooks | favorites |
| Theme | LocalStorage + Context | dark/light mode |

### CSS Best Practices
- [ ] CSS Custom Properties for theming
- [ ] CSS Grid for layouts
- [ ] CSS Transitions and Animations
- [ ] Focus states for accessibility
- [ ] Mobile-first media queries
- [ ] Dark mode via CSS variables

---

## 5. 03-pwa-service-worker.md

### File Structure Requirements
```
/client
  public/
    sw.js                    → Service worker (MUST be in public/)
    manifest.webmanifest      → App manifest
    offline.html              → Offline fallback page
    icons/
      favicon.ico
      apple-touch-icon.png
      pwa-192x192.png
      pwa-512x512.png
      masked-icon.svg
  src/
    sw-register.ts            → SW registration helper
```

### PWA Manifest Requirements
**File**: `client/public/manifest.webmanifest`
- [ ] name: "Recipes PWA - Browse & Save Your Favorite Recipes"
- [ ] short_name: "Recipes"
- [ ] description provided
- [ ] start_url: "/"
- [ ] display: "standalone"
- [ ] background_color: "#ffffff"
- [ ] theme_color: "#ffffff"
- [ ] orientation: "portrait-primary"
- [ ] scope: "/"
- [ ] lang: "en"
- [ ] categories: ["food", "lifestyle"]
- [ ] Icons: 192x192, 512x512 (any + maskable)
- [ ] Screenshots (wide + narrow)
- [ ] Shortcuts: Favorites, Search

### Offline Fallback Page
**File**: `client/public/offline.html`
- [ ] Standalone HTML (no external dependencies)
- [ ] Inline CSS styles
- [ ] "You're Offline" message
- [ ] Link to /favorites
- [ ] Tips for offline usage
- [ ] Auto-redirect to favorites
- [ ] Online event listener

### Service Worker Requirements
**File**: `client/public/sw.js`

#### Cache Configuration
- [ ] CACHE_VERSION defined
- [ ] CACHE_NAMES: static, dynamic, images, api

#### Precache Assets
- [ ] `/`
- [ ] `/index.html`
- [ ] `/offline.html`
- [ ] `/manifest.webmanifest`
- [ ] Icon files

#### Install Event
- [ ] Precaches app shell
- [ ] `skipWaiting()` called

#### Activate Event
- [ ] Cleans up old caches
- [ ] `clients.claim()` called

#### Fetch Event Strategies
- [ ] API calls: Network First with cache fallback
- [ ] Images: Stale While Revalidate
- [ ] Navigation: Network First with offline.html fallback
- [ ] Static assets: Cache First

#### Caching Functions
- [ ] `networkFirst(request, cacheName)`
- [ ] `cacheFirst(request, cacheName)`
- [ ] `staleWhileRevalidate(request, cacheName)`

#### Message Handling
- [ ] SKIP_WAITING message handler
- [ ] GET_VERSION message handler

#### Background Sync (Future)
- [ ] Sync event listener
- [ ] `syncFavorites()` function stub

### Service Worker Registration
**File**: `client/src/sw-register.ts`
- [ ] `registerSW()` function
- [ ] `unregisterSW()` function
- [ ] `checkForUpdates()` function
- [ ] `applyUpdate()` function
- [ ] `getSWVersion()` function
- [ ] `isStandalone()` function
- [ ] `isIOS()` function
- [ ] `canInstall()` function
- [ ] Update notification dispatch

### Caching Strategy Summary
| Resource Type | Strategy | Cache Name | TTL |
|---------------|----------|------------|-----|
| App Shell | Cache First | static-v1 | Until SW update |
| API Responses | Network First | api-v1 | 5 min |
| Images | Stale While Revalidate | images-v1 | 7 days |
| Navigation | Network First + Offline Fallback | dynamic-v1 | 5 min |

### Testing Requirements (PWA)
- [ ] App installs correctly
- [ ] Service worker registers
- [ ] Offline mode works
- [ ] Cache updates properly
- [ ] Offline fallback displays

### Browser Support
| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Service Worker | ✅ 40+ | ✅ 44+ | ✅ 11.1+ | ✅ 17+ |
| Cache API | ✅ 40+ | ✅ 44+ | ✅ 11.1+ | ✅ 17+ |
| IndexedDB | ✅ 24+ | ✅ 16+ | ✅ 10+ | ✅ 12+ |
| PWA Install | ✅ | ✅ | ⚠️ Limited | ✅ |

---

## 6. 04-indexeddb-offline.md

### File Structure Requirements
```
/client/src/features/favorites/
  db.ts              → IndexedDB database helpers
  hooks.ts           → React hooks for favorites
  types.ts           → TypeScript interfaces
```

### Database Schema
```
Database: recipes-pwa
Version: 1
Object Stores:
  - favorites
    - Key: idMeal (string)
    - Value: Meal object with addedAt timestamp
    - Indexes:
      - by-addedAt (for sorting)
      - by-category (for filtering)
```

### Type Definitions Required
**File**: `client/src/features/favorites/types.ts`
- [ ] `FavoriteMeal` interface (extends Meal with addedAt)
- [ ] `DB_NAME`: "recipes-pwa"
- [ ] `DB_VERSION`: 1
- [ ] `STORE_NAME`: "favorites"
- [ ] `SortOption` type: 'newest' | 'oldest' | 'name' | 'category'
- [ ] `FilterOptions` interface

### IndexedDB Helper Functions
**File**: `client/src/features/favorites/db.ts`
- [ ] `getDB()` - singleton database connection
- [ ] `saveFavorite(meal)` - add to favorites
- [ ] `removeFavorite(mealId)` - remove from favorites
- [ ] `getFavorite(mealId)` - get single favorite
- [ ] `isFavorite(mealId)` - check if favorited
- [ ] `getAllFavorites(sort, filters)` - get all with sorting/filtering
- [ ] `getFavoritesCount()` - count of favorites
- [ ] `getFavoriteCategories()` - unique categories
- [ ] `clearAllFavorites()` - clear all
- [ ] `exportFavorites()` - JSON export
- [ ] `importFavorites(jsonString)` - JSON import

### React Hooks Required
**File**: `client/src/features/favorites/hooks.ts`

#### Query Keys
- [ ] `favoritesKeys.all`
- [ ] `favoritesKeys.lists()`
- [ ] `favoritesKeys.list(sort, filters)`
- [ ] `favoritesKeys.detail(id)`
- [ ] `favoritesKeys.count()`
- [ ] `favoritesKeys.categories()`

#### Hooks
- [ ] `useFavorites(sort, filters)` - get all favorites
- [ ] `useFavorite(mealId)` - get single favorite
- [ ] `useIsFavorite(mealId)` - check favorite status
- [ ] `useFavoritesCount()` - get count
- [ ] `useFavoriteCategories()` - get categories
- [ ] `useAddFavorite()` - add mutation with toast
- [ ] `useRemoveFavorite()` - remove mutation with toast
- [ ] `useToggleFavorite()` - toggle helper
- [ ] `useClearFavorites()` - clear all mutation
- [ ] `useFavoritesManager()` - combined manager hook
- [ ] `useFavoritesSync()` - online/offline sync

### FavoriteButton Component
**File**: `client/src/components/recipe/FavoriteButton.tsx`
- [ ] Heart icon from lucide-react
- [ ] Uses `useIsFavorite` hook
- [ ] Uses `useToggleFavorite` hook
- [ ] Loading states
- [ ] ARIA attributes (aria-label, aria-pressed)
- [ ] Visual feedback for favorited state

### Offline Behavior Requirements

#### Online Mode
- [ ] Click "Add to Favorites" → IndexedDB save → UI update → Toast

#### Offline Mode
- [ ] App loads from service worker cache
- [ ] Favorites load from IndexedDB
- [ ] Can view all saved favorites
- [ ] Can add/remove favorites
- [ ] Changes persist in IndexedDB
- [ ] Toast shows "Offline" status

#### Coming Back Online
- [ ] Service worker detects online status
- [ ] App can fetch fresh data
- [ ] Favorites remain in IndexedDB

### Testing Checklist (IndexedDB)
- [ ] Add favorite while online
- [ ] Add favorite while offline
- [ ] Remove favorite while online
- [ ] Remove favorite while offline
- [ ] View favorites while offline
- [ ] Sort favorites (newest, oldest, name, category)
- [ ] Filter favorites by category
- [ ] Search favorites
- [ ] Clear all favorites
- [ ] Favorites persist after app restart
- [ ] Favorites persist after service worker update
- [ ] Toast notifications work
- [ ] Loading states display
- [ ] Error handling works

---

## 7. 05-ui-components-pages.md

### Component Architecture
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
  layout/
    Header.tsx
    Layout.tsx
    Footer.tsx
  recipe/
    RecipeCard.tsx
    RecipeGrid.tsx
    CategoryChip.tsx
    IngredientList.tsx
    FavoriteButton.tsx
    YouTubeEmbed.tsx
  common/
    ErrorBoundary.tsx
    EmptyState.tsx
    LoadingSpinner.tsx
    SearchBar.tsx
    OfflineIndicator.tsx
    InstallPrompt.tsx
```

### Pages Required
```
src/pages/
  Home.tsx               → Search, categories, recipe grid
  Details.tsx            → Full recipe view
  Favorites.tsx          → Saved favorites (offline-capable)
```

### Layout Components

#### Header Component
**File**: `client/src/components/layout/Header.tsx`
- [ ] Logo with home link
- [ ] Desktop navigation (Home, Favorites)
- [ ] Favorites count badge
- [ ] Theme toggle
- [ ] Mobile menu toggle
- [ ] Sticky positioning
- [ ] Backdrop blur effect

#### Layout Component
**File**: `client/src/components/layout/Layout.tsx`
- [ ] Skip link for accessibility
- [ ] Header
- [ ] Main content area
- [ ] Footer
- [ ] OfflineIndicator
- [ ] InstallPrompt

#### Footer Component
**File**: `client/src/components/layout/Footer.tsx`
- [ ] Brand section
- [ ] Quick links
- [ ] Features list
- [ ] Social links
- [ ] Copyright year
- [ ] Powered by TheMealDB attribution

### Recipe Components

#### RecipeCard Component
**File**: `client/src/components/recipe/RecipeCard.tsx`
- [ ] Meal image with lazy loading
- [ ] Meal name
- [ ] Category badge
- [ ] Area information
- [ ] FavoriteButton (when full meal)
- [ ] Link to details page
- [ ] Hover effects
- [ ] ARIA labels

#### RecipeGrid Component
**File**: `client/src/components/recipe/RecipeGrid.tsx`
- [ ] Responsive grid layout
- [ ] Skeleton loading states
- [ ] Empty state handling
- [ ] ARIA role="list"

#### CategoryChip Component
**File**: `client/src/components/recipe/CategoryChip.tsx`
- [ ] Category thumbnail
- [ ] Category name
- [ ] Link to filter by category
- [ ] Selected state styling
- [ ] ARIA pressed state

#### IngredientList Component
**File**: `client/src/components/recipe/IngredientList.tsx`
- [ ] Check icon for each ingredient
- [ ] Measure + ingredient display
- [ ] Hover effects
- [ ] Empty state handling

#### YouTubeEmbed Component
**File**: `client/src/components/recipe/YouTubeEmbed.tsx`
- [ ] Thumbnail display
- [ ] Play button overlay
- [ ] Lazy iframe loading
- [ ] Fallback for invalid URLs

### Common Components

#### SearchBar Component
**File**: `client/src/components/common/SearchBar.tsx`
- [ ] Search icon
- [ ] Input with placeholder
- [ ] Clear button
- [ ] Debounced search
- [ ] URL sync (searchParams)
- [ ] ARIA labels

#### EmptyState Component
**File**: `client/src/components/common/EmptyState.tsx`
- [ ] Icon prop
- [ ] Title
- [ ] Description
- [ ] Optional action button
- [ ] Centered layout

#### ErrorBoundary Component
**File**: `client/src/components/common/ErrorBoundary.tsx`
- [ ] Catches React errors
- [ ] Fallback UI
- [ ] Error logging
- [ ] Refresh button

#### OfflineIndicator Component
**File**: `client/src/components/common/OfflineIndicator.tsx`
- [ ] Online/offline state detection
- [ ] Toast notifications on change
- [ ] No visual render (toast only)

#### InstallPrompt Component
**File**: `client/src/components/common/InstallPrompt.tsx`
- [ ] beforeinstallprompt event handling
- [ ] Install button/modal
- [ ] iOS install instructions

### Page Requirements

#### Home Page
**File**: `client/src/pages/Home.tsx`
- [ ] Hero section with title
- [ ] Random recipe button
- [ ] Categories section with chips
- [ ] Recipe results grid
- [ ] Search query handling
- [ ] Category filter handling
- [ ] Loading skeletons
- [ ] Empty states

#### Details Page
**File**: `client/src/pages/Details.tsx`
- [ ] Meal ID from URL params
- [ ] Loading skeletons
- [ ] Back navigation link
- [ ] Meal image
- [ ] Meal title and metadata
- [ ] FavoriteButton
- [ ] Category and area badges
- [ ] Ingredients list
- [ ] Instructions
- [ ] YouTube embed (if available)
- [ ] Error handling
- [ ] 404 for not found

#### Favorites Page
**File**: `client/src/pages/Favorites.tsx`
- [ ] Page header with count
- [ ] Search input for favorites
- [ ] Category filter dropdown
- [ ] Sort dropdown
- [ ] Clear all button with confirmation
- [ ] Favorites grid
- [ ] Empty state with CTA
- [ ] Offline-ready

### Accessibility Features

#### Keyboard Navigation
- [ ] All interactive elements focusable
- [ ] Skip link for main content
- [ ] Focus visible outlines
- [ ] Logical tab order

#### ARIA Labels
- [ ] Landmark roles (main, nav, search)
- [ ] Button labels
- [ ] Image alt text
- [ ] List roles
- [ ] Dialog labels

#### Screen Reader Support
- [ ] Semantic HTML (article, section, nav)
- [ ] Descriptive link text
- [ ] Status announcements
- [ ] Error messages

#### Color Contrast
- [ ] WCAG AA compliant

---

## 8. 06-testing-deployment.md

### Testing Strategy

#### Unit Testing
**Framework**: Vitest + React Testing Library

**Setup Requirements**:
- [ ] `vitest.config.ts` configured
- [ ] `src/test/setup.ts` with:
  - [ ] @testing-library/jest-dom import
  - [ ] Cleanup after each test
  - [ ] fake-indexeddb/auto mock
  - [ ] Service worker mock
  - [ ] matchMedia mock

**Test Files Required**:
- [ ] `RecipeCard.test.tsx` - component rendering
- [ ] `db.test.ts` - IndexedDB operations

#### Integration Testing
- [ ] Favorites flow testing
- [ ] Add/remove favorites
- [ ] Search functionality
- [ ] Category filtering

#### E2E Testing
**Framework**: Playwright

**Setup Requirements**:
- [ ] `playwright.config.ts` configured
- [ ] Multiple browser projects (chromium, firefox, webkit)
- [ ] Mobile device testing
- [ ] Web server configuration

**Test Files Required**:
- [ ] `e2e/favorites.spec.ts` - favorites flow
- [ ] Offline mode testing

#### Accessibility Testing
- [ ] axe-core integration
- [ ] Automated accessibility scans
- [ ] No violations on all pages

#### PWA Testing
- [ ] Manifest validation
- [ ] Service worker registration
- [ ] Offline page loading

### Deployment Guide (Vercel)

#### Project Structure
```
recipes-pwa/
├── api/                        # Vercel Serverless Functions
│   ├── meals/
│   │   ├── search.ts
│   │   [id].ts
│   │   categories.ts
│   │   filter.ts
│   │   └── random.ts
│   └── health.ts
├── src/                       # React frontend
├── public/
│   sw.js
│   manifest.webmanifest
│   icons/
├── vercel.json
└── package.json
```

#### Vercel Configuration
**File**: `vercel.json`
- [ ] buildCommand configured
- [ ] outputDirectory: dist
- [ ] framework: vite
- [ ] Serverless function runtime: nodejs20.x
- [ ] Rewrites for SPA routing
- [ ] Cache headers for assets
- [ ] No-cache headers for sw.js and manifest

#### API Routes as Serverless Functions
- [ ] `api/meals/search.ts` - search endpoint
- [ ] `api/meals/[id].ts` - meal details
- [ ] `api/categories.ts` - categories with caching
- [ ] `api/filter.ts` - category filter
- [ ] `api/random.ts` - random meal
- [ ] `api/health.ts` - health check

#### Environment Variables
- [ ] `MEALDB_API_BASE`
- [ ] `MEALDB_API_KEY`

### Performance Optimization

#### Build Optimization
- [ ] Manual chunks for vendors
- [ ] Chunk size warning limit
- [ ] Sourcemaps

#### Image Optimization
- [ ] WebP format with fallbacks
- [ ] Lazy loading
- [ ] Responsive images

### Monitoring & Analytics

#### Error Tracking
- [ ] Sentry integration (optional)
- [ ] Browser tracing
- [ ] Session replay

#### Performance Monitoring
- [ ] Web Vitals tracking
- [ ] CLS, FID, FCP, LCP, TTFB

### Security Checklist
- [ ] API key never exposed to client
- [ ] CORS configured correctly
- [ ] Helmet security headers enabled
- [ ] Input validation on all endpoints
- [ ] HTTPS enforced in production
- [ ] Content Security Policy configured
- [ ] Dependencies regularly updated
- [ ] No sensitive data in logs

### Launch Checklist

#### Pre-Launch
- [ ] All tests passing
- [ ] Accessibility audit complete
- [ ] Performance audit complete
- [ ] Security audit complete
- [ ] PWA audit complete
- [ ] Cross-browser testing done
- [ ] Mobile testing done
- [ ] Offline functionality verified

#### Launch
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Environment variables set
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] CDN configured
- [ ] Monitoring active

#### Post-Launch
- [ ] Error tracking active
- [ ] Performance monitoring active
- [ ] User feedback collection
- [ ] Analytics tracking
- [ ] Backup strategy in place
- [ ] Rollback plan documented

---

## 9. 07-review-findings.md

### Key Updates Applied

#### Vercel Deployment (UPDATED)
- [ ] Single deployment for frontend and API
- [ ] Automatic HTTPS and SSL certificates
- [ ] Edge caching for fast global delivery
- [ ] Serverless functions with auto-scaling
- [ ] Preview deployments for testing

#### Service Worker Location (CLARIFIED)
- [ ] Service worker at `public/sw.js`
- [ ] Correct scope (`/` instead of `/src/`)
- [ ] Required for Vercel deployment

#### State Management (SIMPLIFIED)
- [ ] No Zustand - using React Query + local state only
- [ ] TanStack Query for server state
- [ ] Local useState for UI state
- [ ] URL search params for shareable state
- [ ] IndexedDB for offline data

#### CSS Features (UPDATED)
- [ ] CSS Custom Properties (CSS Variables)
- [ ] CSS Grid for layouts
- [ ] CSS Transitions and Animations
- [ ] Focus Visible for accessibility
- [ ] Mobile-first media queries
- [ ] Dark mode via CSS variables

**Removed (not production-ready)**:
- Container queries
- View Transitions API
- CSS Scroll-Driven Animations
- CSS Layers

### Architecture Summary

#### Technology Stack (Vercel-Optimized)
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 + Vite | UI library + build tool |
| Styling | Tailwind CSS+ shadcn/ui | Utility-first CSS + components |
| State | TanStack Query + useState | Server + local state |
| Offline | IndexedDB (idb) | Persistent local storage |
| PWA | Service Worker + Manifest | Installability + offline |
| API | Vercel Serverless Functions | API proxy |
| Security | Environment variables | API key protection |

### Data Flow
```
User → React Components → TanStack Query → Vercel Serverless Functions → TheMealDB API                    ↓
              IndexedDB (Favorites)                    ↓
              Service Worker (Cache)
```

### Offline Strategy
1. **Favorites**: Always stored in IndexedDB (works offline)
2. **API Data**: Cached by service worker (network-first strategy)
3. **Images**: Cached with stale-while-revalidate
4. **App Shell**: Precached on install

### Implementation Order (Vercel-Optimized)
1. Project Setup (Vite, Tailwind, shadcn/ui)
2. API Layer (Vercel serverless functions)
3. PWA Setup (service worker, manifest)
4. IndexedDB (database, hooks)
5. UI Components (common, recipe, pages)
6. Testing & Deploy

### Deployment Checklist (Vercel)
- [ ] Connect GitHub repository to Vercel
- [ ] Configure environment variables
- [ ] Deploy and test

### PWA Verification
- [ ] App installs correctly
- [ ] Service worker registers
- [ ] Offline mode works
- [ ] Favorites persist offline
- [ ] Manifest is valid

---

## Summary Statistics

| Category | Count |
|----------|-------|
| Total Requirements | ~250+ |
| Backend Requirements | ~40 |
| Frontend Requirements | ~80 |
| PWA Requirements | ~35 |
| IndexedDB Requirements | ~30 |
| UI Component Requirements | ~50 |
| Testing Requirements | ~30 |
| Deployment Requirements | ~25 |

---

## Usage Instructions

1. **For Code Review**: Use this checklist to verify each requirement against the actual codebase
2. **For Testing**: Reference the testing sections for specific test cases
3. **For Deployment**: Follow the deployment checklist before going to production
4. **For Audits**: Use the accessibility and security checklists for compliance

---

*This checklist was generated from the plan files in `/plans` directory.*
