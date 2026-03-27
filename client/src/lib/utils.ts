import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge Tailwind classes with conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format date string
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

/**
 * Extract YouTube video ID from URL
 */
export function getYouTubeVideoId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  return match ? match[1] : null
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Parse recipe instructions into formatted steps
 * Handles various formats from TheMealDB API
 */
export function parseInstructions(instructions: string | null | undefined): string[] {
  if (!instructions) return []
  
  // Clean up the instructions
  let text = instructions.trim()
  
  // Remove recipe title if present at the start (ends with colon and is short)
  const colonMatch = text.match(/^[^:]+:\s*/)
  if (colonMatch && colonMatch[0].length < 100) {
    text = text.slice(colonMatch[0].length)
  }
  
  // Try different splitting patterns in order of specificity
  
  // Pattern 1: "STEP 1", "Step 2", "step 3" etc.
  const stepPattern = /\bSTEP\s*\d+[\.:]?\s*/i
  if (stepPattern.test(text)) {
    const parts = text.split(/\b(?=STEP\s*\d+[\.:]?\s*)/i)
    const steps = parts
      .map(part => part.replace(/^\s*STEP\s*\d+[\.:]?\s*/i, '').trim())
      .filter(part => part.length > 10)
    if (steps.length > 1) return steps
  }
  
  // Pattern 2: Numbered steps at start of sentences "1.", "2.", "1)", "2)"
  // Must be followed by a space and then uppercase letter or action word
  const numberedPattern = /(?:^|\n)\s*(\d+[\.\)]\s+)[A-Z]/
  if (numberedPattern.test(text)) {
    const parts = text.split(/(?:^|\n)\s*(?=\d+[\.\)]\s+[A-Z])/)
    const steps = parts
      .map(part => part.replace(/^\s*\d+[\.\)]\s+/, '').trim())
      .filter(part => part.length > 10)
    if (steps.length > 1) return steps
  }
  
  // Pattern 3: Split by newlines that look like step breaks
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0)
  
  if (lines.length > 1) {
    // Check if lines look like separate steps (not just wrapped text)
    const avgLength = lines.reduce((sum, l) => sum + l.length, 0) / lines.length
    const hasNumberedLines = lines.some(l => /^\d+[\.\)]\s/.test(l))
    
    if (avgLength > 50 || hasNumberedLines) {
      return lines
        .map(line => line.replace(/^\d+[\.\)]\s+/, '').trim())
        .filter(line => line.length > 10)
    }
  }
  
  // Pattern 4: Split by sentences for long single paragraphs
  // Group into logical cooking steps
  const sentences = text.match(/[^.!?]+[.!?]+/g)
  
  if (sentences && sentences.length > 2) {
    // Try to group sentences into logical steps
    const steps: string[] = []
    let currentStep = ''
    
    for (const sentence of sentences) {
      const trimmed = sentence.trim()
      
      // Start new step if:
      // 1. Current step is already substantial (>150 chars)
      // 2. AND this sentence starts with an action word
      const actionWords = ['heat', 'add', 'mix', 'stir', 'cook', 'place', 'tip', 'pour', 'serve', 'season', 'chop', 'slice', 'dice', 'fry', 'bake', 'boil', 'roast', 'grill', 'simmer', 'drain', 'whisk', 'beat', 'fold', 'spoon', 'spread', 'cover', 'remove', 'allow', 'leave', 'set aside', 'mould', 'toss', 'finely', 'gradually', 'carefully', 'plate', 'soak', 'use', 'drizzle', 'rub', 'cut', 'preheat', 'warm', 'blend', 'combine', 'sprinkle', 'scatter']
      const startsWithAction = new RegExp(`^(${actionWords.join('|')})\\b`, 'i').test(trimmed)
      
      if (currentStep.length > 150 && startsWithAction) {
        steps.push(currentStep.trim())
        currentStep = trimmed
      } else {
        currentStep += (currentStep ? ' ' : '') + trimmed
      }
    }
    
    if (currentStep.trim()) {
      steps.push(currentStep.trim())
    }
    
    if (steps.length > 1) return steps
  }
  
  // Fallback: return the whole text as one step
  return [text]
}
