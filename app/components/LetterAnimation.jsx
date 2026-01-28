'use client'

import { useEffect, useRef, useState } from 'react'
import { letterWidths, letterDefinitions, Letter, Line, Curve, wordLength, Vector } from '../texttest/letters'
import { MorphingSystem } from '../texttest/morphing'
import { animationConfig } from './LetterAnimation.config'

const initialWord = animationConfig.words[0]

export default function LetterAnimation() {
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
          width: window.innerWidth,
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
      morphingSystemRef.current.scale = animationConfig.scale
    }
    const morphingSystem = morphingSystemRef.current

    let lastTime = performance.now()

    // Set canvas context properties once (they don't change)
    ctx.fillStyle = animationConfig.canvas.fillStyle
    ctx.strokeStyle = animationConfig.canvas.strokeStyle
    ctx.lineCap = animationConfig.canvas.lineCap
    ctx.lineWidth = animationConfig.canvas.lineWidth

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
      morphingSystem.scale = animationConfig.scale

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
        const currentScale = morphingSystem.scale || animationConfig.scale
        const scaledSpacing = spacing * currentScale
        const wordWidth = wordLength(word, spacing) * currentScale
        let x = centerX - wordWidth / 2
        const y = centerY

        // Draw each letter with scaled positions
        word.split('').forEach(letter => {
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
            animationConfig.scale
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
    <div className="flex flex-col justify-center items-center w-full bg-black relative">
      <h2 className="text-white text-7xl z-10 absolute tracking-widest absolute top-60"
      style={{
        backgroundImage: 'url(/images/edited.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center bottom',
        backgroundRepeat: 'no-repeat',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        filter: 'grayscale(100%) brightness(300%) contrast(70%)',
      }}>
        Interested and Competent in
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
    </div>
  )
}
