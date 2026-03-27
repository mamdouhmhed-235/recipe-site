import { useState, useEffect } from 'react'
import { RefreshCw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function UpdatePrompt() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    // Check for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg)
        
        // Check for updates on page load
        reg.update()
        
        // Listen for new service worker installation
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker is installed and ready to take over
                setShowUpdatePrompt(true)
              }
            })
          }
        })
      })

      // Listen for controller change (when new SW takes over)
      let refreshing = false
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true
          window.location.reload()
        }
      })
    }
  }, [])

  const handleUpdate = () => {
    if (registration && registration.waiting) {
      // Tell the waiting service worker to skip waiting and become active
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    }
    setShowUpdatePrompt(false)
  }

  const handleDismiss = () => {
    setShowUpdatePrompt(false)
  }

  if (!showUpdatePrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-background border rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <RefreshCw className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm">Update Available</h4>
          <p className="text-sm text-muted-foreground mt-1">
            A new version of the app is available. Refresh to update.
          </p>
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={handleUpdate}>
              Refresh Now
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDismiss}>
              Later
            </Button>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleDismiss}
          aria-label="Dismiss update prompt"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
