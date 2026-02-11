'use client'

import { useEffect, useRef, useState } from 'react'
import { letterWidths, letterDefinitions, Letter, Line, Curve, wordLength, Vector } from '../texttest/letters'
import { MorphingSystem } from '../texttest/morphing'
import { animationConfig } from '../components/LetterAnimation.config'
import TexturedText from '@/components/TexturedText.jsx'

const initialWord = animationConfig.words[0]

// Calculate responsive scale based on window width
const getResponsiveScale = (width) => {
  const baseWidth = 1200 // Reference width where scale = 1.0
  const minScale = 0.4
  const maxScale = 1.5
  const scale = width / baseWidth
  return Math.min(Math.max(scale, minScale), maxScale)
}

// Split text into lines if too wide for canvas
const splitIntoLines = (text, maxWidth, spacing, scale) => {
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

export default function LetterAnimationSection() {
  const canvasRef = useRef(null)
  const animationFrameRef = useRef(null)
  const morphingSystemRef = useRef(null)
  const cycleTimeoutRef = useRef(null)
  const [morphingActive, setMorphingActive] = useState(false)
  const [currentWord, setCurrentWord] = useState(initialWord)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

  // Initialize canvas size and handle resize
  useEffect(() => {
    const updateCanvasSize = () => {
      if (typeof window !== 'undefined') {
        setCanvasSize({
          width: document.documentElement.clientWidth,
          height: window.innerHeight
        })
      }
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)

    return () => {
      window.removeEventListener('resize', updateCanvasSize)
    }
  }, [])

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || canvasSize.width === 0) return

    // Set canvas dimensions
    canvas.width = canvasSize.width
    canvas.height = canvasSize.height

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.translate(animationConfig.canvasTranslateOffset, animationConfig.canvasTranslateOffset)

    // Initialize morphing system
    if (!morphingSystemRef.current) {
      morphingSystemRef.current = new MorphingSystem()
      morphingSystemRef.current.sourceWord = initialWord
    }
    const morphingSystem = morphingSystemRef.current
    const responsiveScale = getResponsiveScale(canvasSize.width)

    let lastTime = performance.now()

    // Set canvas context properties
    ctx.fillStyle = animationConfig.canvas.fillStyle
    ctx.strokeStyle = animationConfig.canvas.strokeStyle
    ctx.lineCap = animationConfig.canvas.lineCap
    ctx.lineWidth = animationConfig.canvas.lineWidth * responsiveScale

    const spacing = animationConfig.spacing
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    const draw = (currentTime) => {
      // Clear canvas
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Calculate deltaTime in seconds
      const deltaTime = (currentTime - lastTime) / animationConfig.deltaTimeMultiplier
      lastTime = currentTime

      // Update scale
      morphingSystem.scale = responsiveScale

      // Always update morphing system (physics continues even after morphing completes)
      if (morphingSystem.morphs && morphingSystem.morphs.length > 0) {
        morphingSystem.update(currentTime, deltaTime)
        morphingSystem.draw(ctx)

        if (morphingSystem.isActive()) {
          setMorphingActive(true)
        } else {
          setMorphingActive(false)
          const word = morphingSystem.getCurrentWord() || initialWord
          setCurrentWord(word)
        }
      } else {
        setMorphingActive(false)

        // Draw static word only if no morphs exist
        const word = morphingSystem.getCurrentWord() || initialWord
        setCurrentWord(word)
        const currentScale = morphingSystem.scale || responsiveScale
        const scaledSpacing = spacing * currentScale
        const maxWidth = canvas.width * 0.9 // 90% of canvas width
        const lineHeight = 140 * currentScale // Vertical spacing between lines
        
        // Split into lines if needed
        const lines = splitIntoLines(word, maxWidth, spacing, currentScale)
        const totalHeight = (lines.length - 1) * lineHeight
        const startY = centerY - totalHeight / 2

        // Draw each line
        lines.forEach((line, lineIndex) => {
          const lineWidth = wordLength(line, spacing) * currentScale
          let x = centerX - lineWidth / 2
          const y = startY + lineIndex * lineHeight

          // Draw each letter with scaled positions
          line.split('').forEach(letter => {
            const letterWidth = (letterWidths[letter] || animationConfig.defaultLetterWidth) * currentScale
            const letterShapes = letterDefinitions[letter] || []

            letterShapes.forEach(shape => {
              if (shape instanceof Line) {
                const start = shape.position.multiply(currentScale).add(new Vector(x, y))
                const direction = Vector.fromAngle(shape.dir, shape.length * currentScale)
                const end = start.add(direction)

                ctx.beginPath()
                ctx.moveTo(start.x, start.y)
                ctx.lineTo(end.x, end.y)
                ctx.stroke()
              } else if (shape instanceof Curve) {
                const p1 = shape.p1.multiply(currentScale).add(new Vector(x, y))
                const p2 = shape.p2.multiply(currentScale).add(new Vector(x, y))
                const p3 = shape.p3.multiply(currentScale).add(new Vector(x, y))

                ctx.beginPath()
                ctx.moveTo(p1.x, p1.y)
                ctx.quadraticCurveTo(p2.x, p2.y, p3.x, p3.y)
                ctx.stroke()
              }
            })

            x += letterWidth + scaledSpacing
          })
        })
      }

      animationFrameRef.current = requestAnimationFrame(draw)
    }

    draw(performance.now())

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [canvasSize])

  // Auto-cycle logic
  useEffect(() => {
    if (!morphingSystemRef.current || canvasSize.width === 0) return

    // When morphing completes, wait DISPLAY_DURATION then cycle to next word
    if (!morphingActive) {
      const startCycle = () => {
        const canvas = canvasRef.current
        if (!canvas || !morphingSystemRef.current) return

        const centerX = canvas.width / 2
        const centerY = canvas.height / 2

        const current = morphingSystemRef.current.getCurrentWord() || initialWord
        const currentIndex = animationConfig.words.findIndex(w => w === current.toUpperCase())
        const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % animationConfig.words.length
        const targetWord = animationConfig.words[nextIndex]

        if (current.toUpperCase() !== targetWord.toUpperCase()) {
          morphingSystemRef.current.startMorph(
            current, 
            targetWord, 
            centerX, 
            centerY, 
            animationConfig.spacing, 
            getResponsiveScale(canvas.width),
            canvas.width * 0.9 // max width for line splitting
          )
          setMorphingActive(true)
        }
      }

      // Clear any existing timeout
      if (cycleTimeoutRef.current) {
        clearTimeout(cycleTimeoutRef.current)
      }

      // Set timeout to cycle after display duration
      cycleTimeoutRef.current = setTimeout(startCycle, animationConfig.displayDuration)
    }

    return () => {
      if (cycleTimeoutRef.current) {
        clearTimeout(cycleTimeoutRef.current)
      }
    }
  }, [morphingActive, canvasSize])

  return (
    <div className="flex flex-col justify-center items-center w-full bg-black relative h-screen">
      <svg
        className="absolute top-0 left-0 w-full z-50"
        height="34"
        width="100%"
        viewBox="0 0 100 35"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <polyline
            points="0,0 50,34 100,0 100,-10 0,-10"
            fill="#0a0a0a"
            stroke="#a3a3a3"  /* neutral-400 */
            strokeWidth="5"
        />
      </svg>
      <h2 className="text-white text-5xl lg:text-7xl z-10 absolute tracking-widest absolute top-60 text-center">
        <TexturedText>
          Interested and Competent in
        </TexturedText>
      </h2>
      <canvas 
        ref={canvasRef} 
        width={canvasSize.width} 
        height={canvasSize.height}
        className="block"
        style={{ 
          width: canvasSize.width > 0 ? `${canvasSize.width}px` : '100%',
          height: canvasSize.height > 0 ? `${canvasSize.height}px` : '100vh'
        }}
      />
      <div
        className="absolute top-0 left-0 w-full h-full -z-50"
        style={{
            background: 'linear-gradient(0deg, #fff2 0%, #0000 30%)',
            opacity: 0.7,
            pointerEvents: 'none',
            zIndex: 10,
        }}
    />
    <div
        className="absolute top-0 left-0 w-full h-full -z-50"
        style={{
            background: 'linear-gradient(180deg, #fff2 0%, #0000 30%)',
            opacity: 0.7,
            pointerEvents: 'none',
            zIndex: 10,
        }}
    />
    </div>
    
    
  )
}
