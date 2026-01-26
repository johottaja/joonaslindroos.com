import { letterDefinitions, letterWidths, Line, Curve, wordLength } from './letters'

// Easing function for smooth animation
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

// Extract all shapes from a word with their positions
function extractAllShapes(word, startX, startY, spacing) {
  const shapes = []
  let currentX = startX
  
  for (const letter of word) {
    const letterShapes = letterDefinitions[letter] || []
    const letterWidth = letterWidths[letter] || 50
    
    letterShapes.forEach(shape => {
      // Create a copy of the shape with position info
      shapes.push({
        shape: shape,
        letterX: currentX,
        letterY: startY,
        letter: letter
      })
    })
    
    currentX += letterWidth + spacing
  }
  
  return shapes
}

// Create random mapping between source and target shapes
// All source shapes are used - if there are more source shapes than target shapes,
// multiple source shapes will map to the same target shape
function createShapeMapping(sourceShapes, targetShapes) {
  const mapping = []
  
  if (targetShapes.length === 0 || sourceShapes.length === 0) {
    return mapping
  }
  
  // Shuffle source shapes for random assignment
  const shuffledIndices = Array.from({ length: sourceShapes.length }, (_, i) => i)
  for (let i = shuffledIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]]
  }
  
  // First, assign one source shape to each target shape
  // If there are more target shapes than source shapes, reuse source shapes
  targetShapes.forEach((targetShape, targetIndex) => {
    const sourceIndex = shuffledIndices[targetIndex % shuffledIndices.length]
    const source = sourceShapes[sourceIndex]
    if (source) {
      mapping.push({
        source: source,
        target: targetShape
      })
    }
  })
  
  // If there are remaining source shapes, assign them randomly to target shapes
  for (let i = targetShapes.length; i < sourceShapes.length; i++) {
    const sourceIndex = shuffledIndices[i]
    const source = sourceShapes[sourceIndex]
    if (source && targetShapes.length > 0) {
      const randomTargetIndex = Math.floor(Math.random() * targetShapes.length)
      mapping.push({
        source: source,
        target: targetShapes[randomTargetIndex]
      })
    }
  }
  
  return mapping
}

// Interpolate between two values
function lerp(a, b, t) {
  return a + (b - a) * t
}

// Interpolate angle (handles wrapping)
function lerpAngle(a, b, t) {
  const diff = ((b - a + Math.PI) % (2 * Math.PI)) - Math.PI
  return a + diff * t
}

class ShapeMorph {
  constructor(sourceShape, sourceOffsetX, sourceOffsetY, targetShape, targetOffsetX, targetOffsetY) {
    this.sourceShape = sourceShape.shape
    this.sourceOffsetX = sourceOffsetX
    this.sourceOffsetY = sourceOffsetY
    this.targetShape = targetShape.shape
    this.targetOffsetX = targetOffsetX
    this.targetOffsetY = targetOffsetY
    this.sourceType = sourceShape.shape instanceof Line ? 'Line' : 'Curve'
    this.targetType = targetShape.shape instanceof Line ? 'Line' : 'Curve'
  }
  
  draw(ctx, progress) {
    const easedProgress = easeInOutCubic(progress)
    
    if (this.sourceType === this.targetType) {
      // Same type - direct interpolation
      if (this.sourceType === 'Line') {
        this.drawLineMorph(ctx, easedProgress)
      } else {
        this.drawCurveMorph(ctx, easedProgress)
      }
    } else {
      // Different types - switch at midpoint
      if (easedProgress < 0.5) {
        // First half: draw as source type, interpolate toward target
        const t = easedProgress * 2 // 0 to 1
        if (this.sourceType === 'Line') {
          this.drawLineTransitionFirstHalf(ctx, t)
        } else {
          this.drawCurveTransitionFirstHalf(ctx, t)
        }
      } else {
        // Second half: draw as target type, interpolate from source to target
        const t = (easedProgress - 0.5) * 2 // 0 to 1
        if (this.targetType === 'Line') {
          this.drawLineTransitionSecondHalf(ctx, t)
        } else {
          this.drawCurveTransitionSecondHalf(ctx, t)
        }
      }
    }
  }
  
  drawLineMorph(ctx, t) {
    const source = this.sourceShape
    const target = this.targetShape
    
    const sourceX = source.x + this.sourceOffsetX
    const sourceY = source.y + this.sourceOffsetY
    const sourceEndX = sourceX + source.length * Math.cos(source.dir)
    const sourceEndY = sourceY + source.length * Math.sin(source.dir)
    
    const targetX = target.x + this.targetOffsetX
    const targetY = target.y + this.targetOffsetY
    const targetEndX = targetX + target.length * Math.cos(target.dir)
    const targetEndY = targetY + target.length * Math.sin(target.dir)
    
    const x1 = lerp(sourceX, targetX, t)
    const y1 = lerp(sourceY, targetY, t)
    const x2 = lerp(sourceEndX, targetEndX, t)
    const y2 = lerp(sourceEndY, targetEndY, t)
    
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }
  
  drawCurveMorph(ctx, t) {
    const source = this.sourceShape
    const target = this.targetShape
    
    const x1 = lerp(source.x1 + this.sourceOffsetX, target.x1 + this.targetOffsetX, t)
    const y1 = lerp(source.y1 + this.sourceOffsetY, target.y1 + this.targetOffsetY, t)
    const x2 = lerp(source.x2 + this.sourceOffsetX, target.x2 + this.targetOffsetX, t)
    const y2 = lerp(source.y2 + this.sourceOffsetY, target.y2 + this.targetOffsetY, t)
    const x3 = lerp(source.x3 + this.sourceOffsetX, target.x3 + this.targetOffsetX, t)
    const y3 = lerp(source.y3 + this.sourceOffsetY, target.y3 + this.targetOffsetY, t)
    
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.quadraticCurveTo(x2, y2, x3, y3)
    ctx.stroke()
  }
  
  // First half of Line → Curve: draw as Line, interpolate toward curve
  drawLineTransitionFirstHalf(ctx, t) {
    const source = this.sourceShape
    const target = this.targetShape
    
    const sourceX = source.x + this.sourceOffsetX
    const sourceY = source.y + this.sourceOffsetY
    const sourceEndX = sourceX + source.length * Math.cos(source.dir)
    const sourceEndY = sourceY + source.length * Math.sin(source.dir)
    
    // Convert target curve to line-like representation for interpolation
    const targetX1 = target.x1 + this.targetOffsetX
    const targetY1 = target.y1 + this.targetOffsetY
    const targetX3 = target.x3 + this.targetOffsetX
    const targetY3 = target.y3 + this.targetOffsetY
    
    // Interpolate line endpoints toward curve endpoints
    const x1 = lerp(sourceX, targetX1, t)
    const y1 = lerp(sourceY, targetY1, t)
    const x2 = lerp(sourceEndX, targetX3, t)
    const y2 = lerp(sourceEndY, targetY3, t)
    
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }
  
  // Second half of Line → Curve: draw as Curve, interpolate from line to target curve
  drawCurveTransitionSecondHalf(ctx, t) {
    const source = this.sourceShape
    const target = this.targetShape
    
    // At the midpoint (t=0), we need to match where the first half ended (t=1)
    // First half ended at: line from (targetX1, targetY1) to (targetX3, targetY3)
    // So we start the curve from that same line position (as a curve with midpoint control)
    const targetX1 = target.x1 + this.targetOffsetX
    const targetY1 = target.y1 + this.targetOffsetY
    const targetX2 = target.x2 + this.targetOffsetX
    const targetY2 = target.y2 + this.targetOffsetY
    const targetX3 = target.x3 + this.targetOffsetX
    const targetY3 = target.y3 + this.targetOffsetY
    
    // At t=0, draw a curve that matches the line from (targetX1, targetY1) to (targetX3, targetY3)
    // The curve endpoints match, and control point is at the midpoint
    // At t=1, draw the target curve with its actual control point
    const midX = (targetX1 + targetX3) / 2
    const midY = (targetY1 + targetY3) / 2
    
    const x1 = targetX1 // Start stays at targetX1 (matches first half end)
    const y1 = targetY1 // Start stays at targetY1 (matches first half end)
    const x2 = lerp(midX, targetX2, t) // Control point morphs from midpoint to target control
    const y2 = lerp(midY, targetY2, t)
    const x3 = targetX3 // End stays at targetX3 (matches first half end)
    const y3 = targetY3 // End stays at targetY3 (matches first half end)
    
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.quadraticCurveTo(x2, y2, x3, y3)
    ctx.stroke()
  }
  
  // First half of Curve → Line: draw as Curve, interpolate toward line
  drawCurveTransitionFirstHalf(ctx, t) {
    const source = this.sourceShape
    const target = this.targetShape
    
    const sourceX1 = source.x1 + this.sourceOffsetX
    const sourceY1 = source.y1 + this.sourceOffsetY
    const sourceX2 = source.x2 + this.sourceOffsetX
    const sourceY2 = source.y2 + this.sourceOffsetY
    const sourceX3 = source.x3 + this.sourceOffsetX
    const sourceY3 = source.y3 + this.sourceOffsetY
    
    // Convert target line to curve-like representation
    const targetX = target.x + this.targetOffsetX
    const targetY = target.y + this.targetOffsetY
    const targetEndX = targetX + target.length * Math.cos(target.dir)
    const targetEndY = targetY + target.length * Math.sin(target.dir)
    const targetMidX = (targetX + targetEndX) / 2
    const targetMidY = (targetY + targetEndY) / 2
    
    // Interpolate curve toward line
    const x1 = lerp(sourceX1, targetX, t)
    const y1 = lerp(sourceY1, targetY, t)
    const x2 = lerp(sourceX2, targetMidX, t)
    const y2 = lerp(sourceY2, targetMidY, t)
    const x3 = lerp(sourceX3, targetEndX, t)
    const y3 = lerp(sourceY3, targetEndY, t)
    
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.quadraticCurveTo(x2, y2, x3, y3)
    ctx.stroke()
  }
  
  // Second half of Curve → Line: draw as Line, interpolate from curve to target line
  drawLineTransitionSecondHalf(ctx, t) {
    const source = this.sourceShape
    const target = this.targetShape
    
    // At the midpoint (t=0), we need to match where the first half ended (t=1)
    // First half ended at: curve from (targetX, targetY) to (targetEndX, targetEndY) with midpoint control
    // So we start the line from that same position (curve endpoints)
    const targetX = target.x + this.targetOffsetX
    const targetY = target.y + this.targetOffsetY
    const targetEndX = targetX + target.length * Math.cos(target.dir)
    const targetEndY = targetY + target.length * Math.sin(target.dir)
    
    // At t=0, draw a line that matches the curve endpoints from first half end
    // At t=1, draw the target line (which is the same endpoints, so no change)
    // This ensures continuity - the line is already at the target position
    const x1 = targetX // Start stays at targetX (matches first half end)
    const y1 = targetY // Start stays at targetY (matches first half end)
    const x2 = targetEndX // End stays at targetEndX (matches first half end)
    const y2 = targetEndY // End stays at targetEndY (matches first half end)
    
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }
}

class MorphingSystem {
  constructor() {
    this.active = false
    this.progress = 0
    this.duration = 2000 // 2 seconds in milliseconds
    this.startTime = null
    this.morphs = []
    this.sourceWord = ''
    this.targetWord = ''
    this.spacing = 10
  }
  
  startMorph(sourceWord, targetWord, startX, startY, spacing = 10) {
    this.sourceWord = sourceWord.toUpperCase()
    this.targetWord = targetWord.toUpperCase()
    this.spacing = spacing
    this.active = true
    this.progress = 0
    this.startTime = null
    
    // Extract shapes from both words
    const sourceShapes = extractAllShapes(this.sourceWord, 0, 0, spacing)
    const targetShapes = extractAllShapes(this.targetWord, 0, 0, spacing)
    
    // Calculate positions for both words (centered)
    const sourceWidth = wordLength(this.sourceWord, spacing)
    const targetWidth = wordLength(this.targetWord, spacing)
    const sourceStartX = startX - sourceWidth / 2
    const targetStartX = startX - targetWidth / 2
    
    // Create shape mappings
    const mapping = createShapeMapping(sourceShapes, targetShapes)
    
    // Create morph objects
    this.morphs = mapping.map(({ source, target }) => {
      return new ShapeMorph(
        source,
        source.letterX + sourceStartX,
        source.letterY + startY,
        target,
        target.letterX + targetStartX,
        target.letterY + startY
      )
    })
  }
  
  update(currentTime) {
    if (!this.active) return
    
    if (this.startTime === null) {
      this.startTime = currentTime
    }
    
    const elapsed = currentTime - this.startTime
    this.progress = Math.min(elapsed / this.duration, 1.0)
    
    if (this.progress >= 1.0) {
      this.active = false
    }
  }
  
  isActive() {
    return this.active
  }
  
  draw(ctx) {
    if (!this.active) return
    
    this.morphs.forEach(morph => {
      morph.draw(ctx, this.progress)
    })
  }
  
  getCurrentWord() {
    if (this.progress >= 1.0 || !this.active) {
      return this.targetWord || this.sourceWord
    }
    return this.sourceWord
  }
}

export { MorphingSystem, extractAllShapes, createShapeMapping }
