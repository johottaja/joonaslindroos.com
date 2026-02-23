import { wordLength } from './letters'

// Calculate responsive scale based on window width
function getResponsiveScale(width) {
    const baseWidth = 1200 // Reference width where scale = 1.0
    const minScale = 0.4
    const maxScale = 1.5
    const scale = width / baseWidth
    return Math.min(Math.max(scale, minScale), maxScale)
  }
  
// Split text into lines if too wide for canvas
function splitIntoLines(text, maxWidth, spacing, scale) {
    const totalWidth = wordLength(text, spacing) * scale
    if (totalWidth <= maxWidth) {
      return [text]
    }
    
    // Split at space
    const words = text.split(' ')
    if (words.length === 1) {
      return [text] // Can't split single word
    }
    
    // Find best split point
    const lines = []
    let currentLine = ''
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      const testWidth = wordLength(testLine, spacing) * scale
      
      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    
    if (currentLine) {
      lines.push(currentLine)
    }
    
    return lines
  }

export { getResponsiveScale, splitIntoLines }