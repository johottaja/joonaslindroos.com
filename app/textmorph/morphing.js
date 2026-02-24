import { letterDefinitions, letterWidths, Line, Curve, wordLength, Vector } from './letters'
import { animationConfig } from './LetterMorph.config'
import { splitIntoLines } from './util'

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


class ShapeMorph {
  constructor(sourceShape, sourceOffsetX, sourceOffsetY, targetShape, targetOffsetX, targetOffsetY, scale = 1.0) {
    this.scale = scale
    this.sourceShape = sourceShape.shape
    this.targetShape = targetShape.shape
    this.sourceType = sourceShape.shape instanceof Line ? 'Line' : 'Curve'
    this.targetType = targetShape.shape instanceof Line ? 'Line' : 'Curve'

    this.color = getRandomNeutralColor()

    const sourceShapePos = this.sourceType === 'Line'
      ? this.sourceShape.position
      : this.sourceShape.p1
    this.position = new Vector(
      sourceOffsetX + sourceShapePos.x * scale,
      sourceOffsetY + sourceShapePos.y * scale
    )

    const targetShapePos = this.targetType === 'Line'
      ? this.targetShape.position
      : this.targetShape.p1
    this.targetX = targetOffsetX + targetShapePos.x * scale
    this.targetY = targetOffsetY + targetShapePos.y * scale

    this.maxSpeed = animationConfig.physics.maxSpeedMultiplier * scale
    this.maxForce = animationConfig.physics.maxForceMultiplier * scale
    this.maxSpeedSq = this.maxSpeed * this.maxSpeed
    this.maxForceSq = this.maxForce * this.maxForce
    this.slowDownDistance = animationConfig.physics.slowDownDistance * scale
    this.slowDownDistanceSq = this.slowDownDistance * this.slowDownDistance
    this.velocity = Vector.fromAngle(Math.random() * 2 * Math.PI, this.maxSpeed)
  }

  update(deltaTime) {
    const px = this.position.x, py = this.position.y
    const vx = this.velocity.x, vy = this.velocity.y

    // --- arrive behavior (inlined, zero-alloc) ---
    const dx = this.targetX - px
    const dy = this.targetY - py
    const dSq = dx * dx + dy * dy
    const d = Math.sqrt(dSq)

    let speed = this.maxSpeed
    if (dSq < this.slowDownDistanceSq) {
      speed = d * this.maxSpeed / this.slowDownDistance
    }

    let dvx, dvy
    if (d > 0) {
      const s = speed / d
      dvx = dx * s
      dvy = dy * s
    } else {
      dvx = 0
      dvy = 0
    }

    let sx = dvx - vx
    let sy = dvy - vy
    const steerSq = sx * sx + sy * sy
    if (steerSq > this.maxForceSq) {
      const inv = this.maxForce / Math.sqrt(steerSq)
      sx *= inv
      sy *= inv
    }

    // --- apply steering to velocity ---
    let nvx = vx + sx
    let nvy = vy + sy
    const speedSq = nvx * nvx + nvy * nvy
    if (speedSq > this.maxSpeedSq) {
      const inv = this.maxSpeed / Math.sqrt(speedSq)
      nvx *= inv
      nvy *= inv
    }
    this.velocity.x = nvx
    this.velocity.y = nvy

    // --- update position ---
    this.position.x = px + nvx * deltaTime
    this.position.y = py + nvy * deltaTime
  }

  addToPath(ctx, easedProgress) {
    if (this.sourceType === this.targetType) {
      if (this.sourceType === 'Line') {
        this._lineToLine(ctx, easedProgress)
      } else {
        this._curveToCurve(ctx, easedProgress)
      }
    } else {
      const mid = animationConfig.transition.typeTransitionMidpoint
      const mul = animationConfig.transition.transitionProgressMultiplier
      if (easedProgress < mid) {
        const t = easedProgress * mul
        if (this.sourceType === 'Line') {
          this._lineToCurveFirstHalf(ctx, t)
        } else {
          this._curveToLineFirstHalf(ctx, t)
        }
      } else {
        const t = (easedProgress - mid) * mul
        if (this.targetType === 'Line') {
          this._curveToLineSecondHalf(ctx, t)
        } else {
          this._lineToCurveSecondHalf(ctx, t)
        }
      }
    }
  }

  _lineToLine(ctx, t) {
    const sx = this.position.x, sy = this.position.y
    const src = this.sourceShape, tgt = this.targetShape
    const length = lerp(src.length, tgt.length, t) * this.scale
    const dir = Vector.lerpAngle(src.dir, tgt.dir, t)
    ctx.moveTo(sx, sy)
    ctx.lineTo(sx + length * Math.cos(dir), sy + length * Math.sin(dir))
  }

  _curveToCurve(ctx, t) {
    const px = this.position.x, py = this.position.y
    const src = this.sourceShape, tgt = this.targetShape
    const sc = this.scale
    const sR2x = (src.p2.x - src.p1.x) * sc, sR2y = (src.p2.y - src.p1.y) * sc
    const sR3x = (src.p3.x - src.p1.x) * sc, sR3y = (src.p3.y - src.p1.y) * sc
    const tR2x = (tgt.p2.x - tgt.p1.x) * sc, tR2y = (tgt.p2.y - tgt.p1.y) * sc
    const tR3x = (tgt.p3.x - tgt.p1.x) * sc, tR3y = (tgt.p3.y - tgt.p1.y) * sc
    ctx.moveTo(px, py)
    ctx.quadraticCurveTo(
      px + sR2x + (tR2x - sR2x) * t, py + sR2y + (tR2y - sR2y) * t,
      px + sR3x + (tR3x - sR3x) * t, py + sR3y + (tR3y - sR3y) * t
    )
  }

  _lineToCurveFirstHalf(ctx, t) {
    const sx = this.position.x, sy = this.position.y
    const src = this.sourceShape, tgt = this.targetShape
    const sc = this.scale
    const seLen = src.length * sc
    const sex = seLen * Math.cos(src.dir), sey = seLen * Math.sin(src.dir)
    const tex = (tgt.p3.x - tgt.p1.x) * sc, tey = (tgt.p3.y - tgt.p1.y) * sc
    ctx.moveTo(sx, sy)
    ctx.lineTo(sx + sex + (tex - sex) * t, sy + sey + (tey - sey) * t)
  }

  _lineToCurveSecondHalf(ctx, t) {
    const px = this.position.x, py = this.position.y
    const tgt = this.targetShape
    const sc = this.scale
    const mid = animationConfig.transition.typeTransitionMidpoint
    const tR2x = (tgt.p2.x - tgt.p1.x) * sc, tR2y = (tgt.p2.y - tgt.p1.y) * sc
    const tR3x = (tgt.p3.x - tgt.p1.x) * sc, tR3y = (tgt.p3.y - tgt.p1.y) * sc
    const lmx = tR3x * mid, lmy = tR3y * mid
    ctx.moveTo(px, py)
    ctx.quadraticCurveTo(
      px + lmx + (tR2x - lmx) * t, py + lmy + (tR2y - lmy) * t,
      px + tR3x, py + tR3y
    )
  }

  _curveToLineFirstHalf(ctx, t) {
    const px = this.position.x, py = this.position.y
    const src = this.sourceShape, tgt = this.targetShape
    const sc = this.scale
    const mid = animationConfig.transition.typeTransitionMidpoint
    const sR2x = (src.p2.x - src.p1.x) * sc, sR2y = (src.p2.y - src.p1.y) * sc
    const sR3x = (src.p3.x - src.p1.x) * sc, sR3y = (src.p3.y - src.p1.y) * sc
    const teLen = tgt.length * sc
    const tex = teLen * Math.cos(tgt.dir), tey = teLen * Math.sin(tgt.dir)
    ctx.moveTo(px, py)
    ctx.quadraticCurveTo(
      px + sR2x + (tex * mid - sR2x) * t, py + sR2y + (tey * mid - sR2y) * t,
      px + sR3x + (tex - sR3x) * t, py + sR3y + (tey - sR3y) * t
    )
  }

  _curveToLineSecondHalf(ctx, t) {
    const sx = this.position.x, sy = this.position.y
    const tgt = this.targetShape
    const sc = this.scale
    const teLen = tgt.length * sc
    ctx.moveTo(sx, sy)
    ctx.lineTo(sx + teLen * Math.cos(tgt.dir), sy + teLen * Math.sin(tgt.dir))
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
    
    // startY is the top position for the first line (no centering offset)
    const sourceStartY = startY
    const targetStartY = startY
    
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

    // Sort by color so the draw loop can batch all same-colored shapes
    // into a single beginPath/stroke call
    this.morphs.sort((a, b) => (a.color < b.color ? -1 : a.color > b.color ? 1 : 0))
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
    const morphProgress = this.active ? this.progress : 1.0
    const easedProgress = easeInOutCubic(morphProgress)
    ctx.lineWidth = animationConfig.canvas.lineWidth * this.scale

    // Morphs are sorted by color — batch into one beginPath/stroke per color
    let currentColor = null
    for (let i = 0; i < this.morphs.length; i++) {
      const morph = this.morphs[i]
      if (morph.color !== currentColor) {
        if (currentColor !== null) ctx.stroke()
        currentColor = morph.color
        ctx.strokeStyle = currentColor
        ctx.beginPath()
      }
      morph.addToPath(ctx, easedProgress)
    }
    if (currentColor !== null) ctx.stroke()
  }
  
  isSettled(threshold = 0.5) {
    if (this.active) return false
    const threshSq = threshold * threshold
    for (let i = 0; i < this.morphs.length; i++) {
      const v = this.morphs[i].velocity
      if (v.x * v.x + v.y * v.y >= threshSq) return false
    }
    return true
  }

  getCurrentWord() {
    if (this.progress >= 1.0 || !this.active) {
      return this.targetWord || this.sourceWord
    }
    return this.sourceWord
  }
}

export { MorphingSystem, extractAllShapes, createShapeMapping }
