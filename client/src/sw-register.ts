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
    
    // Note: We don't auto-reload on controllerchange anymore
    // This was causing navigation issues when SW updated during page transitions
    // Users will be prompted to update via the UpdatePrompt component instead
    
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
    const controller = navigator.serviceWorker.controller;
    if (!controller) {
      resolve(null);
      return;
    }
    
    const channel = new MessageChannel();
    
    channel.port1.onmessage = (event) => {
      resolve(event.data.version || null);
    };
    
    controller.postMessage(
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