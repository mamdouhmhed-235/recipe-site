import { useState, useEffect } from 'react'

type ScrollDirection = 'up' | 'down' | null

/**
 * Hook to detect scroll direction
 * @param threshold - Minimum scroll distance before triggering (default: 10)
 * @returns Current scroll direction ('up', 'down', or null at top)
 */
export function useScrollDirection(threshold = 10): ScrollDirection {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // At the top of the page
      if (currentScrollY < 10) {
        setScrollDirection(null)
        setLastScrollY(currentScrollY)
        return
      }

      // Check if we've scrolled past the threshold
      if (Math.abs(currentScrollY - lastScrollY) < threshold) {
        return
      }

      // Determine scroll direction
      if (currentScrollY > lastScrollY) {
        setScrollDirection('down')
      } else {
        setScrollDirection('up')
      }

      setLastScrollY(currentScrollY)
    }

    // Add scroll listener with passive option for better performance
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [lastScrollY, threshold])

  return scrollDirection
}

/**
 * Hook to detect clicks anywhere on the document
 * @returns Boolean indicating if a click occurred (resets after read)
 */
export function useClickDetection() {
  const [clicked, setClicked] = useState(false)

  useEffect(() => {
    const handleClick = () => {
      setClicked(true)
      // Reset after a brief delay
      setTimeout(() => setClicked(false), 100)
    }

    document.addEventListener('click', handleClick)

    return () => {
      document.removeEventListener('click', handleClick)
    }
  }, [])

  return clicked
}
