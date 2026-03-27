# PWA & Service Worker Implementation Plan

## Overview
Complete PWA setup with manifest, service worker, offline support, and installability.

> **Note:** The service worker is placed in `public/sw.js` (not `src/`) because service workers must be served from the root of your application to have the correct scope. This is essential for Vercel deployment and proper caching behavior.

## File Structure
```
/client
  public/
    sw.js                    → Service worker (MUST be in public/ for correct scope)
    manifest.webmanifest      → App manifest
    offline.html              → Offline fallback page
    icons/
      favicon.ico
      apple-touch-icon.png
      pwa-192x192.png
      pwa-512x512.png
      masked-icon.svg
  src/
    sw-register.ts            → SW registration helper (imports from /sw.js)
```

> **Why `public/sw.js`?**
> - Service workers must be served from the application root
> - Ensures correct scope (`/` instead of `/src/`)
> - Required for Vercel deployment
> - Standard practice for Vite projects

## PWA Manifest

**public/manifest.webmanifest**
```json
{
  "name": "Recipes PWA - Browse & Save Your Favorite Recipes",
  "short_name": "Recipes",
  "description": "Browse recipes from TheMealDB, save favorites offline, and cook anytime",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#ffffff",
  "orientation": "portrait-primary",
  "scope": "/",
  "lang": "en",
  "categories": ["food", "lifestyle"],
  "icons": [
    {
      "src": "/icons/pwa-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/pwa-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/pwa-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icons/apple-touch-icon.png",
      "sizes": "180x180",
      "type": "image/png"
    }
  ],
  "screenshots": [
    {
      "src": "/icons/screenshot-wide.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "/icons/screenshot-narrow.png",
      "sizes": "720x1280",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ],
  "shortcuts": [
    {
      "name": "Favorites",
      "short_name": "Favorites",
      "description": "View your saved favorite recipes",
      "url": "/favorites",
      "icons": [{ "src": "/icons/heart.png", "sizes": "96x96" }]
    },
    {
      "name": "Search",
      "short_name": "Search",
      "description": "Search for recipes",
      "url": "/?focus=search",
      "icons": [{ "src": "/icons/search.png", "sizes": "96x96" }]
    }
  ],
  "related_applications": [],
  "prefer_related_applications": false
}
```

## Offline Fallback Page

**public/offline.html**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#ffffff">
  <title>Offline - Recipes PWA</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    
    .container {
      background: white;
      border-radius: 16px;
      padding: 40px;
      max-width: 400px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    
    .icon {
      font-size: 64px;
      margin-bottom: 20px;
    }
    
    h1 {
      color: #333;
      margin-bottom: 12px;
      font-size: 24px;
    }
    
    p {
      color: #666;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
    }
    
    .tips {
      margin-top: 32px;
      text-align: left;
      background: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
    }
    
    .tips h3 {
      color: #333;
      margin-bottom: 12px;
      font-size: 14px;
    }
    
    .tips ul {
      color: #666;
      font-size: 14px;
      padding-left: 20px;
    }
    
    .tips li {
      margin-bottom: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">📡</div>
    <h1>You're Offline</h1>
    <p>
      It looks like you've lost your internet connection. 
      Don't worry - you can still view your saved favorite recipes!
    </p>
    <a href="/favorites" class="button">View Favorites</a>
    
    <div class="tips">
      <h3>💡 Tips while offline:</h3>
      <ul>
        <li>Your favorites are saved locally and always available</li>
        <li>Search and browsing require an internet connection</li>
        <li>Check your connection and try again</li>
      </ul>
    </div>
  </div>
  
  <script>
    // Auto-redirect to favorites if already on app
    if (window.location.pathname !== '/offline') {
      window.location.href = '/favorites';
    }
    
    // Listen for online event
    window.addEventListener('online', () => {
      window.location.href = '/';
    });
  </script>
</body>
</html>
```

## Service Worker Implementation

**public/sw.js**
```javascript
// Service Worker for Recipes PWA
// Version: 1.0.0

const CACHE_VERSION = 'v1';
const CACHE_NAMES = {
  static: `static-${CACHE_VERSION}`,
  dynamic: `dynamic-${CACHE_VERSION}`,
  images: `images-${CACHE_VERSION}`,
  api: `api-${CACHE_VERSION}`
};

// Assets to precache (app shell)
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.webmanifest',
  '/icons/favicon.ico',
  '/icons/apple-touch-icon.png',
  '/icons/pwa-192x192.png',
  '/icons/pwa-512x512.png'
];

// Install event - precache app shell
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAMES.static)
      .then((cache) => {
        console.log('[SW] Precaching app shell');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('[SW] Service worker installed');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Precache failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              // Delete caches from old versions
              return name.startsWith('static-') || 
                     name.startsWith('dynamic-') ||
                     name.startsWith('images-') ||
                     name.startsWith('api-');
            })
            .filter((name) => {
              // Keep current version caches
              return !Object.values(CACHE_NAMES).includes(name);
            })
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Strategy 1: API calls - Network First with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, CACHE_NAMES.api));
    return;
  }
  
  // Strategy 2: Images - Stale While Revalidate
  if (request.destination === 'image' || 
      url.hostname === 'www.themealdb.com' ||
      url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) {
    event.respondWith(staleWhileRevalidate(request, CACHE_NAMES.images));
    return;
  }
  
  // Strategy 3: Navigation requests - Network First with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirst(request, CACHE_NAMES.dynamic)
        .catch(() => {
          return caches.match('/offline.html');
        })
    );
    return;
  }
  
  // Strategy 4: Static assets - Cache First
  if (url.pathname.match(/\.(js|css|woff2?|ttf|eot)$/)) {
    event.respondWith(cacheFirst(request, CACHE_NAMES.static));
    return;
  }
  
  // Default: Network First
  event.respondWith(networkFirst(request, CACHE_NAMES.dynamic));
});

/**
 * Network First Strategy
 * Try network, fall back to cache
 */
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

/**
 * Cache First Strategy
 * Try cache, fall back to network
 */
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache first failed:', error);
    throw error;
  }
}

/**
 * Stale While Revalidate Strategy
 * Return cache immediately, update in background
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => {
      // Network failed, return cached if available
      return cachedResponse;
    });
  
  return cachedResponse || fetchPromise;
}

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
});

// Background sync for offline actions (future enhancement)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-favorites') {
    event.waitUntil(syncFavorites());
  }
});

async function syncFavorites() {
  // Future: Sync favorites with server when back online
  console.log('[SW] Syncing favorites...');
}
```

## Service Worker Registration

**src/sw-register.ts**
```typescript
/**
 * Service Worker Registration Helper
 * Handles registration, updates, and lifecycle events
 */

export interface SWRegistration {
  registration: ServiceWorkerRegistration | null;
  updateAvailable: boolean;
  offlineReady: boolean;
}

let registration: ServiceWorkerRegistration | null = null;
let updateAvailable = false;
let offlineReady = false;

/**
 * Register service worker
 */
export async function registerSW(): Promise<SWRegistration> {
  if (!('serviceWorker' in navigator)) {
    console.log('Service workers are not supported');
    return { registration: null, updateAvailable: false, offlineReady: false };
  }
  
  try {
    registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });
    
    console.log('SW registered:', registration.scope);
    
    // Check for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration?.installing;
      
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available
            updateAvailable = true;
            notifyUpdateAvailable();
          }
        });
      }
    });
    
    // Check if controller changed (new SW activated)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // Reload page to use new service worker
      window.location.reload();
    });
    
    // Mark as offline ready after first install
    if (registration.active) {
      offlineReady = true;
    }
    
    return { registration, updateAvailable, offlineReady };
  } catch (error) {
    console.error('SW registration failed:', error);
    return { registration: null, updateAvailable: false, offlineReady: false };
  }
}

/**
 * Unregister service worker
 */
export async function unregisterSW(): Promise<boolean> {
  if (!registration) {
    return false;
  }
  
  try {
    const unregistered = await registration.unregister();
    console.log('SW unregistered:', unregistered);
    return unregistered;
  } catch (error) {
    console.error('SW unregister failed:', error);
    return false;
  }
}

/**
 * Check for service worker updates
 */
export async function checkForUpdates(): Promise<void> {
  if (!registration) {
    return;
  }
  
  try {
    await registration.update();
    console.log('Checked for SW updates');
  } catch (error) {
    console.error('SW update check failed:', error);
  }
}

/**
 * Notify user about available update
 */
function notifyUpdateAvailable(): void {
  // Dispatch custom event for app to handle
  window.dispatchEvent(new CustomEvent('sw-update-available'));
  
  // You can also show a toast notification here
  console.log('New version available! Refresh to update.');
}

/**
 * Apply pending update
 */
export function applyUpdate(): void {
  if (!registration || !registration.waiting) {
    return;
  }
  
  // Tell waiting SW to skip waiting and become active
  registration.waiting.postMessage({ type: 'SKIP_WAITING' });
}

/**
 * Get service worker version
 */
export async function getSWVersion(): Promise<string | null> {
  if (!navigator.serviceWorker.controller) {
    return null;
  }
  
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    
    channel.port1.onmessage = (event) => {
      resolve(event.data.version || null);
    };
    
    navigator.serviceWorker.controller.postMessage(
      { type: 'GET_VERSION' },
      [channel.port2]
    );
  });
}

/**
 * Check if app is running in standalone mode (installed PWA)
 */
export function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
}

/**
 * Check if device is iOS
 */
export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/**
 * Check if app can be installed
 */
export function canInstall(): boolean {
  return 'BeforeInstallPromptEvent' in window;
}
```

## Update main.tsx to use SW registration

**src/main.tsx** (updated)
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { registerSW } from './sw-register'
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
registerSW().then(({ offlineReady }) => {
  if (offlineReady) {
    console.log('App is ready for offline use')
  }
})
```

## Icon Generation

Create placeholder icons using a simple SVG or use a tool like:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator

**public/icons/masked-icon.svg** (placeholder)
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#667eea"/>
  <text x="256" y="300" font-size="200" text-anchor="middle" fill="white">🍳</text>
</svg>
```

## Caching Strategy Summary

| Resource Type | Strategy | Cache Name | TTL |
|---------------|----------|------------|-----|
| App Shell (HTML, CSS, JS) | Cache First | static-v1 | Until SW update |
| API Responses | Network First | api-v1 | 5 min |
| Images | Stale While Revalidate | images-v1 | 7 days |
| Navigation | Network First + Offline Fallback | dynamic-v1 | 5 min |

## Testing Offline Functionality

### Manual Testing Steps

1. **Install the PWA**
   - Open in Chrome/Edge
   - Click install prompt or use "Install" in menu

2. **Test Offline Mode**
   - Open DevTools → Application → Service Workers
   - Check "Offline" checkbox
   - Refresh page - should show offline.html or cached content

3. **Test Cache Updates**
   - Make changes to app
   - Check for update notification
   - Verify new version loads after refresh

4. **Test API Caching**
   - Browse categories while online
   - Go offline
   - Categories should still be visible

### Automated Testing

```javascript
// Example test for service worker
describe('Service Worker', () => {
  it('should register successfully', async () => {
    const registration = await navigator.serviceWorker.register('/sw.js');
    expect(registration.scope).toBe('/');
  });
  
  it('should cache app shell', async () => {
    const cache = await caches.open('static-v1');
    const keys = await cache.keys();
    expect(keys.length).toBeGreaterThan(0);
  });
});
```

## Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Service Worker | ✅ 40+ | ✅ 44+ | ✅ 11.1+ | ✅ 17+ |
| Cache API | ✅ 40+ | ✅ 44+ | ✅ 11.1+ | ✅ 17+ |
| IndexedDB | ✅ 24+ | ✅ 16+ | ✅ 10+ | ✅ 12+ |
| PWA Install | ✅ | ✅ | ⚠️ Limited | ✅ |

## Next Steps

1. Review this PWA implementation plan
2. Proceed to:
   - `04-indexeddb-offline.md` - Offline favorites storage
   - `05-ui-components-pages.md` - Component implementations
