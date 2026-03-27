# Recipes PWA - Implementation Plans

## Overview

This directory contains comprehensive implementation plans for building a production-ready Recipes Progressive Web App (PWA) using React + Vite, Tailwind CSS, shadcn/ui, and Node.js/Express.

## Project Summary

**Recipes PWA** is a full-stack application that allows users to:
- Browse recipes from TheMealDB API
- Search for recipes by name
- Filter recipes by category
- Save favorite recipes offline using IndexedDB
- Install the app on their device
- Use the app offline with cached data

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT                               │
│  React + Vite + Tailwind + shadcn/ui + TanStack Query      │
│  Service Worker + IndexedDB + PWA Manifest                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/JSON
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        SERVER                               │
│  Node.js + Express + CORS + Helmet + Compression            │
│  In-memory Cache + Environment Variables                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS (API Key Hidden)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   TheMealDB API                             │
└─────────────────────────────────────────────────────────────┘
```

## Plan Documents

### 1. [Architecture Overview](00-architecture-overview.md)
- System architecture diagram
- Data flow patterns
- Key design decisions
- Technology stack summary
- Security considerations
- Performance targets

### 2. [Backend Implementation](01-backend-implementation.md)
- Express server setup
- API routes and endpoints
- Caching middleware
- Error handling
- Environment configuration
- Security measures

### 3. [Frontend Setup](02-frontend-setup.md)
- Vite + React configuration
- Tailwind CSS setup
- shadcn/ui integration
- TanStack Query configuration
- API client implementation
- Project structure

### 4. [PWA & Service Worker](03-pwa-service-worker.md)
- Web app manifest
- Service worker implementation
- Caching strategies
- Offline fallback
- Update handling
- Installation prompts

### 5. [IndexedDB & Offline](04-indexeddb-offline.md)
- Database schema
- CRUD operations
- React hooks
- Offline synchronization
- Data persistence
- Performance optimization

### 6. [UI Components & Pages](05-ui-components-pages.md)
- Layout components
- Recipe components
- Common components
- Page implementations
- Accessibility features
- Responsive design

### 7. [Testing & Deployment](06-testing-deployment.md)
- Unit testing
- Integration testing
- E2E testing
- Accessibility testing
- Deployment guides
- Monitoring setup

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Backend Setup
```bash
cd server
cp .env.example .env
npm install
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

### Access the App
- Frontend: http://localhost:5173
- Backend: http://localhost:5174
- API Health: http://localhost:5174/health

## Key Features

### ✅ Core Functionality
- [x] Search recipes by name
- [x] Browse categories
- [x] View recipe details
- [x] Save favorites
- [x] Offline access to favorites

### ✅ PWA Features
- [x] Installable app
- [x] Offline support
- [x] Service worker caching
- [x] App manifest
- [x] Background sync (future)

### ✅ UI/UX
- [x] Responsive design
- [x] Dark/light theme
- [x] Skeleton loaders
- [x] Toast notifications
- [x] Error boundaries
- [x] Empty states

### ✅ Accessibility
- [x] Keyboard navigation
- [x] Screen reader support
- [x] ARIA labels
- [x] Focus management
- [x] Color contrast

### ✅ Performance
- [x] Code splitting
- [x] Image optimization
- [x] Caching strategies
- [x] Lazy loading
- [x] Bundle optimization

## Technology Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **TanStack Query** - Data fetching
- **React Router** - Navigation
- **IndexedDB (idb)** - Offline storage
- **Sonner** - Toast notifications

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **Helmet** - Security headers
- **CORS** - Cross-origin support
- **Compression** - Response compression

### PWA
- **Service Worker** - Offline caching
- **Web App Manifest** - Installation
- **IndexedDB** - Local storage
- **Cache API** - Asset caching

### Testing
- **Vitest** - Unit testing
- **React Testing Library** - Component testing
- **Playwright** - E2E testing
- **axe-core** - Accessibility testing

### Deployment
- **Render** - Backend hosting
- **Vercel/Netlify** - Frontend hosting
- **GitHub** - Version control

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/search?s={query}` | GET | Search meals by name |
| `/api/meal/:id` | GET | Get meal details |
| `/api/categories` | GET | List all categories |
| `/api/filter?c={category}` | GET | Filter by category |
| `/api/random` | GET | Get random meal |
| `/health` | GET | Health check |

## Caching Strategy

| Resource | Strategy | Duration |
|----------|----------|----------|
| App Shell | Cache-First | Until SW update |
| API Data | Network-First | 5 minutes |
| Images | Stale-While-Revalidate | 7 days |
| Static Assets | Cache-First | 1 year |

## File Structure

```
recipes-pwa/
├── server/
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/
│   │   │   └── mealdb.ts
│   │   ├── middleware/
│   │   │   └── cache.ts
│   │   └── types/
│   │       └── index.ts
│   ├── .env.example
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   ├── layout/
│   │   │   ├── recipe/
│   │   │   └── common/
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Details.tsx
│   │   │   └── Favorites.tsx
│   │   ├── features/
│   │   │   └── favorites/
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   ├── queryClient.ts
│   │   │   └── utils.ts
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── styles/
│   │   │   └── globals.css
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   │   ├── manifest.webmanifest
│   │   ├── offline.html
│   │   └── icons/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.cjs
│   ├── postcss.config.cjs
│   ├── components.json
│   ├── package.json
│   └── tsconfig.json
│
├── plans/
│   ├── README.md
│   ├── 00-architecture-overview.md
│   ├── 01-backend-implementation.md
│   ├── 02-frontend-setup.md
│   ├── 03-pwa-service-worker.md
│   ├── 04-indexeddb-offline.md
│   ├── 05-ui-components-pages.md
│   └── 06-testing-deployment.md
│
└── README.md
```

## Implementation Order

### Phase 1: Foundation
1. Set up project structure
2. Initialize backend server
3. Initialize frontend with Vite
4. Configure Tailwind and shadcn/ui

### Phase 2: Core Features
1. Implement API routes
2. Create API client
3. Build UI components
4. Implement pages

### Phase 3: PWA & Offline
1. Create service worker
2. Implement IndexedDB
3. Add offline support
4. Configure caching

### Phase 4: Polish
1. Add error handling
2. Implement loading states
3. Improve accessibility
4. Add animations

### Phase 5: Testing & Deploy
1. Write unit tests
2. Write integration tests
3. Write E2E tests
4. Deploy to production

## Success Criteria

- ✅ App runs locally with server and client concurrently
- ✅ Client uses only /api/* endpoints
- ✅ Favorites work offline (add/view/remove) using IndexedDB
- ✅ PWA is installable and precaches app shell
- ✅ Search, categories, and detail views all functional
- ✅ Skeletons and error states implemented
- ✅ No API key exposure — server reads MEALDB_API_KEY (default 1)

## Resources

- [TheMealDB API](https://www.themealdb.com/api.php)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query)
- [PWA Documentation](https://web.dev/progressive-web-apps/)

## Support

For questions or issues, refer to the detailed implementation plans in this directory.

## License

MIT
