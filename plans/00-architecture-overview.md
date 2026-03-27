# Recipes PWA - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (React + Vite)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Pages      │  │  Components  │  │   Features   │      │
│  │  - Home      │  │  - Header    │  │  - Favorites │      │
│  │  - Details   │  │  - Cards     │  │  - Search    │      │
│  │  - Favorites │  │  - Skeletons │  │  - Offline   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│           │                │                │               │
│           └────────────────┼────────────────┘               │
│                            │                                │
│                    ┌───────▼───────┐                        │
│                    │  API Client   │                        │
│                    │  (lib/api.ts) │                        │
│                    └───────┬───────┘                        │
│                            │                                │
│                    ┌───────▼───────┐                        │
│                    │ Service Worker│                        │
│                    │  (sw.js)     │                        │
│                    └───────┬───────┘                        │
│                            │                                │
│                    ┌───────▼───────┐                        │
│                    │   IndexedDB   │                        │
│                    │  (idb helper) │                        │
│                    └───────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/JSON
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   SERVER (Node.js + Express)                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Routes:                                             │  │
│  │  - GET /api/search?s=...                             │  │
│  │  - GET /api/meal/:id                                 │  │
│  │  - GET /api/categories                               │  │
│  │  - GET /api/filter?c=...                             │  │
│  │  - GET /api/random                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│           │                                                │
│           ▼                                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Middleware:                                          │  │
│  │  - CORS                                              │  │
│  │  - Helmet (Security)                                 │  │
│  │  - Compression                                       │  │
│  │  - In-memory TTL Cache                               │  │
│  └──────────────────────────────────────────────────────┘  │
│           │                                                │
│           ▼                                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Environment Variables:                              │  │
│  │  - MEALDB_API_KEY (default: 1)                       │  │
│  │  - MEALDB_API_BASE                                   │  │
│  │  - PORT                                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS (API Key Hidden)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   TheMealDB API                             │
│  https://www.themealdb.com/api/json/v1/{API_KEY}/...       │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Search Flow
```
User Input → Search Component → API Client → /api/search → 
Express Proxy → TheMealDB → Response → Cache → UI Update
```

### 2. Favorites Flow (Online)
```
Click Favorite → IndexedDB Save → UI Update → Toast
```

### 3. Favorites Flow (Offline)
```
App Load → Service Worker Check → Offline Mode →
IndexedDB Load → Display Cached Favorites
```

### 4. Caching Strategy
```
Request → Service Worker Intercept →
  - API Calls: Network-First (fall back to cache)
  - Images: Stale-While-Revalidate
  - Static Assets: Cache-First (precache)
```

## Key Design Decisions

### 1. API Proxy Pattern
- **Why**: Hide API key from client, enable caching, rate limiting
- **How**: Express routes forward to TheMealDB with server-side API key
- **Benefit**: Security, control, analytics

### 2. IndexedDB for Favorites
- **Why**: Persistent storage, works offline, large capacity
- **How**: `idb` library for Promise-based API
- **Benefit**: Reliable offline experience

### 3. Service Worker Strategies
- **Network-First for API**: Ensures fresh data when online
- **Stale-While-Revalidate for Images**: Fast loads with background updates
- **Cache-First for Shell**: Instant app load

### 4. TanStack Query
- **Why**: Caching, retries, background updates, devtools
- **How**: Wrap API calls in useQuery/useMutation
- **Benefit**: Reduced boilerplate, better UX

### 5. shadcn/ui
- **Why**: Accessible, customizable, Tailwind-based
- **How**: Copy components into project, modify as needed
- **Benefit**: Production-ready UI without bloat

## Folder Structure Rationale

```
/server
  /src
    /routes      → API endpoints (one file per resource)
    index.ts     → Server entry, middleware setup
  .env.example   → Environment template
  package.json   → Server dependencies

/client
  /src
    /components  → Reusable UI (shadcn + custom)
    /pages       → Route-level components
    /features    → Business logic (favorites, search)
    /lib         → Utilities (api, queryClient)
    /styles      → Global CSS
  /public        → Static assets, manifest, icons
  vite.config.ts → Build configuration
```

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend Framework | React 18 | UI library |
| Build Tool | Vite | Fast dev + production builds |
| Styling | Tailwind CSS | Utility-first CSS |
| UI Components | shadcn/ui | Accessible, customizable components |
| State Management | TanStack Query | Server state + caching |
| Offline Storage | IndexedDB (idb) | Persistent local data |
| PWA | Service Worker + Manifest | Installability + offline |
| Backend | Node.js + Express | API proxy |
| Security | Helmet, CORS, env vars | Production security |
| Caching | In-memory TTL + SW | Performance optimization |

## Security Considerations

1. **API Key Protection**: Never exposed to client, server-side only
2. **CORS**: Restrict to client origin in production
3. **Helmet**: Security headers (XSS, CSRF, etc.)
4. **Input Validation**: Sanitize search queries
5. **Rate Limiting**: Consider adding for production
6. **HTTPS**: Required for PWA + security

## Performance Targets

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Offline Load**: < 500ms (from cache)
- **Lighthouse Score**: 90+ (Performance, Accessibility, PWA)

## Next Steps

1. Review this architecture document
2. Proceed to detailed implementation plans:
   - `01-backend-implementation.md`
   - `02-frontend-setup.md`
   - `03-pwa-service-worker.md`
   - `04-indexeddb-offline.md`
   - `05-ui-components-pages.md`
   - `06-testing-deployment.md`
