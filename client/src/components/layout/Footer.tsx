import { Heart, ExternalLink, Share2, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link 
              to="/" 
              className="flex items-center space-x-2"
              aria-label="Recipes PWA Home"
            >
              <span className="text-2xl">🍳</span>
              <span className="font-bold text-xl">Recipes</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Browse thousands of recipes from around the world. Save favorites and access them offline.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Quick Links</h3>
            <nav className="flex flex-col space-y-2">
              <Link 
                to="/" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Browse Recipes
              </Link>
              <Link 
                to="/favorites" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                My Favorites
              </Link>
              <Link 
                to="/categories" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Categories
              </Link>
            </nav>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="font-semibold">Features</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                Offline Access
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                Save Favorites
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                PWA Support
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                Dark/Light Theme
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h3 className="font-semibold">Connect</h3>
            <div className="flex space-x-4">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <ExternalLink className="h-5 w-5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Share2 className="h-5 w-5" />
              </a>
              <a 
                href="mailto:contact@recipes.app" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
            <p className="text-sm text-muted-foreground">
              Powered by TheMealDB API
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Recipes PWA. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              Made with <Heart className="h-4 w-4 text-red-500 fill-current" /> for food lovers
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}