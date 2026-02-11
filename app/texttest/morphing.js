import { letterDefinitions, letterWidths, Line, Curve, wordLength, Vector } from './letters'
import { animationConfig } from '../components/LetterAnimation.config'

// Split text into lines if too wide
function splitIntoLines(text, maxWidth, spacing, scale) {
  const totalWidth = wordLength(text, spacing) * scale
  if (totalWidth <= maxWidth) {
    return [text]
  }
  
  const words = text.split(' ')
  if (words.length === 1) {
    return [text]
  }
  
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

// Neutral color palette (white to gray shades)
const neutralColors = [
  '#ffffff',  // white
  '#e8e8e8',  // very light gray
  '#c0c0c0',  // light gray
  '#888888',  // gray
]

// Get a random neutral color
function getRandomNeutralColor() {
  return neutralColors[Math.floor(Math.random() * neutralColors.length)]
}

// Easing function for smooth animation
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

// Extract all shapes from a word with their positions
function extractAllShapes(word, startX, startY, spacing, scale = 1.0) {
  const shapes = []
  let currentX = startX
  const scaledSpacing = spacing * scale
  
  for (const letter of word) {
    const letterShapes = letterDefinitions[letter] || []
    const letterWidth = (letterWidths[letter] || animationConfig.defaultLetterWidth) * scale
    
    letterShapes.forEach(shape => {
      // Create a copy of the shape with position info
      shapes.push({
        shape: shape,
        letterX: currentX,
        letterY: startY,
        letter: letter
      })
    })
    
    currentX += letterWidth + scaledSpacing
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

// Interpolate angle (handles wrapping) - now using Vector method
function lerpAngle(a, b, t) {
  return Vector.lerpAngle(a, b, t)
}

// Map function for value remapping
function map(value, x1, y1, x2, y2) {
  return (value - x1) * (y2 - x2) / (y1 - x1) + x2
}

class ShapeMorph {
  constructor(sourceShape, sourceOffsetX, sourceOffsetY, targetShape, targetOffsetX, targetOffsetY, scale = 1.0) {
    this.scale = scale
    this.sourceShape = sourceShape.shape
    this.sourceOffsetX = sourceOffsetX
    this.sourceOffsetY = sourceOffsetY
    this.targetShape = targetShape.shape
    this.targetOffsetX = targetOffsetX
    this.targetOffsetY = targetOffsetY
    this.sourceType = sourceShape.shape instanceof Line ? 'Line' : 'Curve'
    this.targetType = targetShape.shape instanceof Line ? 'Line' : 'Curve'
    
    // Random neutral color for this shape
    this.color = getRandomNeutralColor()
    
    // Position represents the shape's anchor point (start for Line, p1 for Curve)
    // Initialize to source shape's world position (scaled)
    const sourceShapePos = this.sourceType === 'Line' 
      ? this.sourceShape.position 
      : this.sourceShape.p1
    this.position = new Vector(
      sourceOffsetX + sourceShapePos.x * scale,
      sourceOffsetY + sourceShapePos.y * scale
    )
    
    // Target position is target shape's anchor point world position (scaled)
    const targetShapePos = this.targetType === 'Line'
      ? this.targetShape.position
      : this.targetShape.p1
    this.targetPos = new Vector(
      targetOffsetX + targetShapePos.x * scale,
      targetOffsetY + targetShapePos.y * scale
    )
    this.maxSpeed = animationConfig.physics.maxSpeedMultiplier * scale
    this.maxForce = animationConfig.physics.maxForceMultiplier * scale
    this.slowDownDistance = animationConfig.physics.slowDownDistance * scale
    this.slowDownDistanceSquared = this.slowDownDistance * this.slowDownDistance
    this.velocity = Vector.fromAngle(Math.random() * 2 * Math.PI, animationConfig.physics.maxSpeedMultiplier * scale)
  }
  
  arrive(target) {
    // Calculate desired velocity
    const desired = target.subtract(this.position)
    const dSquared = desired.magnitudeSquared()
    const d = Math.sqrt(dSquared)
    let speed = this.maxSpeed
    
    // Reduce speed when close to target (using squared distance for comparison)
    if (dSquared < this.slowDownDistanceSquared) {
      speed = map(d, 0, this.slowDownDistance, 0, this.maxSpeed)
    }
    
    // Normalize and scale desired velocity
    const norm = d > 0 ? desired.normalize() : new Vector(0, 0)
    const desiredVel = norm.multiply(speed)
    
    // Calculate steering force
    let steer = desiredVel.subtract(this.velocity)
    
    // Limit steering force (using squared magnitude for comparison)
    const steerMagSquared = steer.magnitudeSquared()
    if (steerMagSquared > this.maxForce * this.maxForce) {
      steer = steer.normalize().multiply(this.maxForce)
    }
    
    return steer
  }

  update(deltaTime) {
    // Calculate steering force using arrive behavior
    const steer = this.arrive(this.targetPos)
    
    // Apply steering to velocity
    this.velocity = this.velocity.add(steer)
    
    // Limit max speed (using squared magnitude for comparison)
    const speedSquared = this.velocity.magnitudeSquared()
    if (speedSquared > this.maxSpeed * this.maxSpeed) {
      this.velocity = this.velocity.normalize().multiply(this.maxSpeed)
    }
    
    // Update position (velocity is in pixels per second, deltaTime is in seconds)
    this.position = this.position.add(this.velocity.multiply(deltaTime))
  }

  draw(ctx, easedProgress) {
    // easedProgress is now pre-calculated in MorphingSystem.draw()
    
    if (this.sourceType === this.targetType) {
      // Same type - direct interpolation
      if (this.sourceType === 'Line') {
        this.drawLineMorph(ctx, easedProgress)
      } else {
        this.drawCurveMorph(ctx, easedProgress)
      }
    } else {
      // Different types - switch at midpoint
      if (easedProgress < animationConfig.transition.typeTransitionMidpoint) {
        // First half: draw as source type, interpolate toward target
        const t = easedProgress * animationConfig.transition.transitionProgressMultiplier // 0 to 1
        if (this.sourceType === 'Line') {
          this.drawLineTransitionFirstHalf(ctx, t)
        } else {
          this.drawCurveTransitionFirstHalf(ctx, t)
        }
      } else {
        // Second half: draw as target type, interpolate from source to target
        const t = (easedProgress - animationConfig.transition.typeTransitionMidpoint) * animationConfig.transition.transitionProgressMultiplier // 0 to 1
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
    
    // this.position is the shape's start point (moved by physics)
    const start = this.position
    
    // Interpolate shape properties: length and direction (scaled)
    const length = lerp(source.length, target.length, t) * this.scale
    const dir = lerpAngle(source.dir, target.dir, t)
    
    const direction = Vector.fromAngle(dir, length)
    const end = start.add(direction)
    
    ctx.beginPath()
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x, end.y)
    ctx.stroke()
  }
  
  drawCurveMorph(ctx, t) {
    const source = this.sourceShape
    const target = this.targetShape
    
    // this.position is the shape's p1 (moved by physics)
    const p1 = this.position
    
    // Calculate control and end points relative to p1 (scaled)
    const sourceRelP2 = source.p2.subtract(source.p1).multiply(this.scale)
    const sourceRelP3 = source.p3.subtract(source.p1).multiply(this.scale)
    
    const targetRelP2 = target.p2.subtract(target.p1).multiply(this.scale)
    const targetRelP3 = target.p3.subtract(target.p1).multiply(this.scale)
    
    // Interpolate relative positions
    const p2Rel = Vector.lerp(sourceRelP2, targetRelP2, t)
    const p3Rel = Vector.lerp(sourceRelP3, targetRelP3, t)
    
    const p2 = p1.add(p2Rel)
    const p3 = p1.add(p3Rel)
    
    ctx.beginPath()
    ctx.moveTo(p1.x, p1.y)
    ctx.quadraticCurveTo(p2.x, p2.y, p3.x, p3.y)
    ctx.stroke()
  }
  
  // First half of Line → Curve: draw as Line, interpolate toward curve
  drawLineTransitionFirstHalf(ctx, t) {
    const source = this.sourceShape
    const target = this.targetShape
    
    // this.position is the shape's start point (moved by physics)
    const start = this.position
    
    // Interpolate end point direction (scaled)
    const sourceEnd = Vector.fromAngle(source.dir, source.length * this.scale)
    const targetEndRel = target.p3.subtract(target.p1).multiply(this.scale)
    
    const endRel = Vector.lerp(sourceEnd, targetEndRel, t)
    const end = start.add(endRel)
    
    ctx.beginPath()
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x, end.y)
    ctx.stroke()
  }
  
  // Second half of Line → Curve: draw as Curve, interpolate from line to target curve
  drawCurveTransitionSecondHalf(ctx, t) {
    const target = this.targetShape
    
    // this.position is the shape's p1 (moved by physics, should be near target p1 by now)
    const p1 = this.position
    
    // Target curve points relative to target p1 (scaled)
    const targetRelP2 = target.p2.subtract(target.p1).multiply(this.scale)
    const targetRelP3 = target.p3.subtract(target.p1).multiply(this.scale)
    
    // At t=0, curve should look like the line from end of first half
    // First half ended with line pointing to targetRelP3
    // For a straight line as curve: p2 at midpoint between p1 and p3
    const lineMidRel = targetRelP3.multiply(animationConfig.transition.typeTransitionMidpoint)
    const p2Rel = Vector.lerp(lineMidRel, targetRelP2, t)
    // p3 is already at target position (first half moved it there)
    const p3Rel = targetRelP3
    
    const p2 = p1.add(p2Rel)
    const p3 = p1.add(p3Rel)
    
    ctx.beginPath()
    ctx.moveTo(p1.x, p1.y)
    ctx.quadraticCurveTo(p2.x, p2.y, p3.x, p3.y)
    ctx.stroke()
  }
  
  // First half of Curve → Line: draw as Curve, interpolate toward line
  drawCurveTransitionFirstHalf(ctx, t) {
    const source = this.sourceShape
    const target = this.targetShape
    
    // this.position is the shape's p1 (moved by physics)
    const p1 = this.position
    
    // Calculate control and end points relative to p1 (scaled)
    const sourceRelP2 = source.p2.subtract(source.p1).multiply(this.scale)
    const sourceRelP3 = source.p3.subtract(source.p1).multiply(this.scale)
    
    // Target line end relative to target start (scaled)
    const targetEnd = Vector.fromAngle(target.dir, target.length * this.scale)
    
    // Interpolate: curve morphs toward line
    const p2Rel = Vector.lerp(sourceRelP2, targetEnd.multiply(animationConfig.transition.typeTransitionMidpoint), t)
    const p3Rel = Vector.lerp(sourceRelP3, targetEnd, t)
    
    const p2 = p1.add(p2Rel)
    const p3 = p1.add(p3Rel)
    
    ctx.beginPath()
    ctx.moveTo(p1.x, p1.y)
    ctx.quadraticCurveTo(p2.x, p2.y, p3.x, p3.y)
    ctx.stroke()
  }
  
  // Second half of Curve → Line: draw as Line, interpolate from curve to target line
  drawLineTransitionSecondHalf(ctx, t) {
    const target = this.targetShape
    
    // this.position is the shape's start point (moved by physics, should be near target start by now)
    const start = this.position
    
    // First half ended with curve looking like a line pointing to targetEnd
    // So at t=0, we're already at targetEnd, and at t=1, still at targetEnd
    // No interpolation needed - endpoint is already at target position
    const targetEnd = Vector.fromAngle(target.dir, target.length * this.scale)
    const end = start.add(targetEnd)
    
    ctx.beginPath()
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x, end.y)
    ctx.stroke()
  }
}

class MorphingSystem {
  constructor() {
    this.active = false
    this.progress = 0
    this.duration = animationConfig.morphDuration
    this.startTime = null
    this.morphs = []
    this.sourceWord = ''
    this.targetWord = ''
    this.spacing = animationConfig.spacing
    this.scale = animationConfig.scale
  }
  
  startMorph(sourceWord, targetWord, startX, startY, spacing = animationConfig.spacing, scale = animationConfig.scale, maxWidth = Infinity) {
    this.sourceWord = sourceWord.toUpperCase()
    this.targetWord = targetWord.toUpperCase()
    this.spacing = spacing
    this.scale = scale
    this.active = true
    this.progress = 0
    this.startTime = null
    
    const lineHeight = 140 * scale
    
    // Split both words into lines
    const sourceLines = splitIntoLines(this.sourceWord, maxWidth, spacing, scale)
    const targetLines = splitIntoLines(this.targetWord, maxWidth, spacing, scale)
    
    // Calculate vertical offsets for centering
    const sourceTotalHeight = (sourceLines.length - 1) * lineHeight
    const targetTotalHeight = (targetLines.length - 1) * lineHeight
    const sourceStartY = startY - sourceTotalHeight / 2
    const targetStartY = startY - targetTotalHeight / 2
    
    // Extract shapes from all lines with proper positions
    const sourceShapes = []
    sourceLines.forEach((line, lineIndex) => {
      const lineWidth = wordLength(line, spacing) * scale
      const lineStartX = startX - lineWidth / 2
      const lineY = sourceStartY + lineIndex * lineHeight
      const shapes = extractAllShapes(line, 0, 0, spacing, scale)
      shapes.forEach(shape => {
        shape.letterX += lineStartX
        shape.letterY += lineY
      })
      sourceShapes.push(...shapes)
    })
    
    const targetShapes = []
    targetLines.forEach((line, lineIndex) => {
      const lineWidth = wordLength(line, spacing) * scale
      const lineStartX = startX - lineWidth / 2
      const lineY = targetStartY + lineIndex * lineHeight
      const shapes = extractAllShapes(line, 0, 0, spacing, scale)
      shapes.forEach(shape => {
        shape.letterX += lineStartX
        shape.letterY += lineY
      })
      targetShapes.push(...shapes)
    })
    
    // Create shape mappings
    const mapping = createShapeMapping(sourceShapes, targetShapes)
    
    // Create morph objects (with scaling)
    this.morphs = mapping.map(({ source, target }) => {
      return new ShapeMorph(
        source,
        source.letterX,
        source.letterY,
        target,
        target.letterX,
        target.letterY,
        scale
      )
    })
  }
  
  update(currentTime, deltaTime) {
    // Update physics for all morphs (always, even after morphing completes)
    for (let i = 0; i < this.morphs.length; i++) {
      this.morphs[i].update(deltaTime)
    }
    
    // Update morphing progress
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
    // Draw all morphs (even after morphing completes, use progress = 1.0)
    const morphProgress = this.active ? this.progress : 1.0
    
    // Calculate eased progress once for all morphs (performance optimization)
    const easedProgress = easeInOutCubic(morphProgress)
    
    // Set line width from config, scaled by current scale
    ctx.lineWidth = animationConfig.canvas.lineWidth * this.scale
    
    this.morphs.forEach(morph => {
      ctx.strokeStyle = morph.color
      morph.draw(ctx, easedProgress)
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
