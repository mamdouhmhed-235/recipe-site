import type { ReactNode } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { OfflineIndicator } from '@/components/common/OfflineIndicator'
import { InstallPrompt } from '@/components/common/InstallPrompt'
import { UpdatePrompt } from '@/components/common/UpdatePrompt'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Skip Link for Accessibility */}
      <a 
        href="#main-content" 
        className="skip-link"
      >
        Skip to main content
      </a>
      
      <Header />
      
      <main 
        id="main-content" 
        className="flex-1 container py-6"
        role="main"
      >
        {children}
      </main>
      
      <Footer />
      
      {/* Global Components */}
      <OfflineIndicator />
      <InstallPrompt />
      <UpdatePrompt />
    </div>
  )
}

export default Layout