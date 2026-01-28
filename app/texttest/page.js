'use client'

import { useEffect, useRef, useState } from 'react'
import { letterWidths, letterDefinitions, Letter, Line, Curve, wordLength, Vector } from './letters'
import { MorphingSystem } from './morphing'

// Words to cycle through
const words = ["MACHINE LEARNING", "ARTIFICIAL INTELLIGENCE", "WEIGHTLIFTING"]
const initialWord = words[0]

export default function TextTest() {
  const canvasRef = useRef(null)
  const animationFrameRef = useRef(null)
  const morphingSystemRef = useRef(null)
  const [morphingActive, setMorphingActive] = useState(false)
  const [currentWord, setCurrentWord] = useState(initialWord)
  const [scale, setScale] = useState(1.0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.translate(0.5, 0.5);

    // Initialize morphing system
    if (!morphingSystemRef.current) {
      morphingSystemRef.current = new MorphingSystem()
      morphingSystemRef.current.sourceWord = initialWord
      morphingSystemRef.current.scale = scale
    }
    const morphingSystem = morphingSystemRef.current

    let lastTime = performance.now()
    
    // Set canvas context properties once (they don't change)
    ctx.fillStyle = '#000'
    ctx.strokeStyle = '#fff'
    ctx.lineCap = 'square'
    const baseLineWidth = 5
    
    const spacing = 10
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    
    const draw = (currentTime) => {
      // Clear canvas
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Calculate deltaTime in seconds
      const deltaTime = (currentTime - lastTime) / 1000
      lastTime = currentTime
      
      // Update scale if it changed
      morphingSystem.scale = scale
      
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
        const currentScale = morphingSystem.scale || scale
        const scaledSpacing = spacing * currentScale
        const wordWidth = wordLength(word, spacing) * currentScale
        let x = centerX - wordWidth / 2
        const y = centerY
        
        // Save context state
        const savedLineWidth = ctx.lineWidth
        ctx.lineWidth = baseLineWidth
        
        // Draw each letter with scaled positions
        word.split('').forEach(letter => {
          const letterWidth = (letterWidths[letter] || 50) * currentScale
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
        
        // Restore context
        ctx.lineWidth = savedLineWidth
      }
      
      animationFrameRef.current = requestAnimationFrame(draw)
    }

    draw(performance.now())

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [scale])

  const getNextWord = (current) => {
    const currentIndex = words.findIndex(w => w === current.toUpperCase())
    if (currentIndex === -1) {
      // If current word not in list, start from first word
      return words[0]
    }
    // Cycle to next word, wrapping around
    return words[(currentIndex + 1) % words.length]
  }

  const handleMorph = () => {
    const canvas = canvasRef.current
    if (!canvas || !morphingSystemRef.current) return
    
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const spacing = 10
    
    const current = morphingSystemRef.current.getCurrentWord() || initialWord
    const sourceWord = current
    const targetWord = getNextWord(current)
    
    morphingSystemRef.current.startMorph(sourceWord, targetWord, centerX, centerY, spacing, scale)
    setMorphingActive(true)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#000' }}>
      <canvas ref={canvasRef} width={1200} height={800} style={{ marginBottom: '20px' }}></canvas>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
        <button
          onClick={handleMorph}
          disabled={morphingActive}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: morphingActive ? '#555' : '#fff',
            color: morphingActive ? '#999' : '#000',
            border: 'none',
            borderRadius: '5px',
            cursor: morphingActive ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          Morph to {getNextWord(currentWord)}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' }}>
          <label htmlFor="scale">Scale:</label>
          <input
            id="scale"
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            disabled={morphingActive}
            style={{ width: '200px' }}
          />
          <span>{scale.toFixed(1)}x</span>
        </div>
      </div>
    </div>
  )
}
