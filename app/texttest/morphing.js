import { letterDefinitions, letterWidths, Line, Curve, wordLength, Vector } from './letters'

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

// Interpolate angle (handles wrapping) - now using Vector method
function lerpAngle(a, b, t) {
  return Vector.lerpAngle(a, b, t)
}

// Map function for value remapping
function map(value, x1, y1, x2, y2) {
  return (value - x1) * (y2 - x2) / (y1 - x1) + x2
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
    
    // Position represents the shape's anchor point (start for Line, p1 for Curve)
    // Initialize to source shape's world position
    const sourceShapePos = this.sourceType === 'Line' 
      ? this.sourceShape.position 
      : this.sourceShape.p1
    this.position = new Vector(
      sourceOffsetX + sourceShapePos.x,
      sourceOffsetY + sourceShapePos.y
    )
    
    // Target position is target shape's anchor point world position
    const targetShapePos = this.targetType === 'Line'
      ? this.targetShape.position
      : this.targetShape.p1
    this.targetPos = new Vector(
      targetOffsetX + targetShapePos.x,
      targetOffsetY + targetShapePos.y
    )
    this.maxSpeed = 1000
    this.maxForce = 50
    this.velocity = Vector.fromAngle(Math.random() * 2 * Math.PI, 1000)
  }
  
  arrive(target) {
    // Calculate desired velocity
    const desired = target.subtract(this.position)
    const d = desired.magnitude()
    let speed = this.maxSpeed
    
    // Reduce speed when close to target
    if (d < 100) {
      speed = map(d, 0, 100, 0, this.maxSpeed)
    }
    
    // Normalize and scale desired velocity
    const norm = d > 0 ? desired.normalize() : new Vector(0, 0)
    const desiredVel = norm.multiply(speed)
    
    // Calculate steering force
    let steer = desiredVel.subtract(this.velocity)
    
    // Limit steering force
    const steerMag = steer.magnitude()
    if (steerMag > this.maxForce) {
      steer = steer.normalize().multiply(this.maxForce)
    }
    
    return steer
  }

  update(deltaTime) {
    // Calculate steering force using arrive behavior
    const steer = this.arrive(this.targetPos)
    
    // Apply steering to velocity
    this.velocity = this.velocity.add(steer)
    
    // Limit max speed
    const speed = this.velocity.magnitude()
    if (speed > this.maxSpeed) {
      this.velocity = this.velocity.normalize().multiply(this.maxSpeed)
    }
    
    // Update position (velocity is in pixels per second, deltaTime is in seconds)
    this.position = this.position.add(this.velocity.multiply(deltaTime))
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
    
    // this.position is the shape's start point (moved by physics)
    const start = this.position
    
    // Interpolate shape properties: length and direction
    const length = lerp(source.length, target.length, t)
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
    
    // Calculate control and end points relative to p1
    const sourceRelP2 = source.p2.subtract(source.p1)
    const sourceRelP3 = source.p3.subtract(source.p1)
    
    const targetRelP2 = target.p2.subtract(target.p1)
    const targetRelP3 = target.p3.subtract(target.p1)
    
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
    
    // Interpolate end point direction
    const sourceEnd = Vector.fromAngle(source.dir, source.length)
    const targetEndRel = target.p3.subtract(target.p1)
    
    const endRel = Vector.lerp(sourceEnd, targetEndRel, t)
    const end = start.add(endRel)
    
    ctx.beginPath()
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x, end.y)
    ctx.stroke()
  }
  
  // Second half of Line → Curve: draw as Curve, interpolate from line to target curve
  drawCurveTransitionSecondHalf(ctx, t) {
    const source = this.sourceShape
    const target = this.targetShape
    
    // this.position is the shape's p1 (moved by physics, should be near target p1 by now)
    const p1 = this.position
    
    // At t=0, we want a curve that matches the line from first half
    // The line goes from p1 to some end point
    // Calculate approximate line end based on source line direction
    const sourceEnd = Vector.fromAngle(source.dir, source.length)
    
    // Target curve points relative to target p1
    const targetRelP2 = target.p2.subtract(target.p1)
    const targetRelP3 = target.p3.subtract(target.p1)
    
    // At t=0: control at midpoint, end at line end
    // At t=1: control and end at target positions
    const lineMidRel = sourceEnd.multiply(0.5)
    const p2Rel = Vector.lerp(lineMidRel, targetRelP2, t)
    const p3Rel = Vector.lerp(sourceEnd, targetRelP3, t)
    
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
    
    // Calculate control and end points relative to p1
    const sourceRelP2 = source.p2.subtract(source.p1)
    const sourceRelP3 = source.p3.subtract(source.p1)
    
    // Target line end relative to target start
    const targetEnd = Vector.fromAngle(target.dir, target.length)
    
    // Interpolate: curve morphs toward line
    const p2Rel = Vector.lerp(sourceRelP2, targetEnd.multiply(0.5), t)
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
    const source = this.sourceShape
    const target = this.targetShape
    
    // this.position is the shape's start point (moved by physics, should be near target start by now)
    const start = this.position
    
    // At t=0, end point is source curve end (p3) relative to current start
    // At t=1, end point is target line end
    const sourceEndRel = source.p3.subtract(source.p1)
    const targetEnd = Vector.fromAngle(target.dir, target.length)
    
    const endRel = Vector.lerp(sourceEndRel, targetEnd, t)
    const end = start.add(endRel)
    
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
  
  update(currentTime, deltaTime) {
    // Update physics for all morphs (always, even after morphing completes)
    this.morphs.forEach(morph => {
      morph.update(deltaTime)
    })
    
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
    
    this.morphs.forEach(morph => {
      morph.draw(ctx, morphProgress)
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
