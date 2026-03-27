# Recipes PWA

A Progressive Web App for browsing and saving recipes from TheMealDB API. Built with React, TypeScript, and Vite.

## Features

- 🍳 Browse recipes by category
- 🔍 Search recipes by name
- ❤️ Save favorites locally (works offline)
- 📱 Install as PWA on mobile/desktop
- 🌙 Dark/light theme support
- ♿ Accessible (WCAG compliant)
- 🚀 Fast and optimized

## Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **TanStack Query** - Data fetching
- **React Router** - Navigation
- **IndexedDB** - Offline storage

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety

### Testing
- **Vitest** - Unit testing
- **Playwright** - E2E testing
- **axe-core** - Accessibility testing

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd recipe-site

# Install dependencies
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### Development

```bash
# Start both client and server
npm run dev

# Or start individually:
# Client (http://localhost:5173)
cd client
npm run dev

# Server (http://localhost:5174)
cd server
npm run dev
```

### Building

```bash
# Build client
cd client
npm run build

# Build server
cd ../server
npm run build
```

### Testing

```bash
# Unit tests
cd client
npm test

# E2E tests
npm run test:e2e

# Accessibility tests
npm run test:e2e -- --grep "Accessibility"
```

## Project Structure

```
recipe-site/
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   ├── features/      # Feature modules
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilities
│   │   └── styles/        # Global styles
│   ├── public/            # Static assets
│   └── e2e/               # E2E tests
├── server/                # Backend Express app
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   └── types/         # TypeScript types
│   └── dist/              # Compiled output
└── plans/                 # Implementation plans
```

## API Endpoints

- `GET /api/search?s={query}` - Search recipes
- `GET /api/meal/:id` - Get recipe details
- `GET /api/categories` - List categories
- `GET /api/filter?c={category}` - Filter by category
- `GET /api/random` - Get random recipe
- `GET /health` - Health check

## PWA Features

- **Offline Support** - Service worker caches assets and API responses
- **Installable** - Can be installed on mobile/desktop
- **Background Sync** - Syncs favorites when back online
- **Push Notifications** - Update notifications

## Accessibility

- Keyboard navigation
- Screen reader support
- ARIA labels
- Focus management
- Color contrast (WCAG AA)

## Deployment

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables

Create `.env` files in both client and server directories:

**client/.env**
```
VITE_API_URL=http://localhost:5174
```

**server/.env**
```
PORT=5174
CLIENT_ORIGIN=http://localhost:5173
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- [TheMealDB](https://www.themealdb.com/) for the recipe API
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [Lucide](https://lucide.dev/) for icons
