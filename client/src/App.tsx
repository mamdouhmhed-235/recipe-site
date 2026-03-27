import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/layout/Layout'
import { LoadingSpinner } from './components/common/LoadingSpinner'
import ErrorBoundary from './components/common/ErrorBoundary'

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home'))
const Details = lazy(() => import('./pages/Details'))
const Favorites = lazy(() => import('./pages/Favorites'))
const Categories = lazy(() => import('./pages/Categories'))

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <Layout>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/meal/:id" element={<Details />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/categories" element={<Categories />} />
              </Routes>
            </Suspense>
          </Layout>
          <Toaster position="bottom-right" richColors />
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
