import { useEffect } from 'react'
import { toast } from 'sonner'

export function OfflineIndicator() {
  useEffect(() => {
    const handleOnline = () => {
      toast.success('Back online', {
        duration: 3000
      })
    }
    
    const handleOffline = () => {
      toast.warning('You are offline', {
        description: 'Favorites are still available',
        duration: 5000
      })
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  // Don't render anything, just handle toasts
  return null
}