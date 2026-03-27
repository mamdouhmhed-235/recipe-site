import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// Helper functions to detect platform state
const detectIOS = (): boolean => {
  if (typeof window === 'undefined') return false
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as any
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !win.MSStream
}

const detectStandalone = (): boolean => {
  if (typeof window === 'undefined') return false
  const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isIOSStandalone = (window.navigator as any).standalone === true
  return isInStandaloneMode || isIOSStandalone
}

// Initialize once at module level to avoid setState in effect
const initialIsIOS = detectIOS()
const initialIsStandalone = detectStandalone()

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isIOS] = useState(initialIsIOS)
  const [isStandalone] = useState(initialIsStandalone)

  useEffect(() => {
    // Only show prompt if not already installed
    if (!isStandalone) {
      const handler = (e: Event) => {
        e.preventDefault()
        setDeferredPrompt(e as BeforeInstallPromptEvent)
        setShowInstallPrompt(true)
      }

      window.addEventListener('beforeinstallprompt', handler)

      return () => {
        window.removeEventListener('beforeinstallprompt', handler)
      }
    }
  }, [isStandalone])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setShowInstallPrompt(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
  }

  // Don't show if already installed or on iOS (iOS doesn't support beforeinstallprompt)
  if (!showInstallPrompt || isStandalone) return null

  // Show iOS-specific instructions
  if (isIOS && !isStandalone) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-background border rounded-lg shadow-lg p-4 z-50">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Download className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm">Install Recipes App</h4>
            <p className="text-sm text-muted-foreground mt-1">
              To install this app on your iOS device, tap the share button and then "Add to Home Screen"
            </p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="ghost" onClick={handleDismiss}>
                Got it
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleDismiss}
            aria-label="Dismiss install prompt"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  // Show standard install prompt for non-iOS
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-background border rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <Download className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm">Install Recipes App</h4>
          <p className="text-sm text-muted-foreground mt-1">
            Install our app for offline access and a better experience
          </p>
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={handleInstall}>
              Install
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDismiss}>
              Not now
            </Button>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleDismiss}
          aria-label="Dismiss install prompt"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
