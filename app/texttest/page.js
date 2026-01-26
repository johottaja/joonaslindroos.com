'use client'

import { useEffect, useRef, useState } from 'react'
import { letterWidths, letterDefinitions, Letter, Line, Curve, wordLength } from './letters'
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
    }
    const morphingSystem = morphingSystemRef.current

    let lastTime = performance.now()
    
    const draw = (currentTime) => {
      ctx.fillStyle = '#111'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      ctx.fillStyle = '#eee'
      ctx.strokeStyle = '#fff'
      ctx.lineCap = 'square'
      ctx.lineWidth = 5
      
      const spacing = 10
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      
      // Calculate deltaTime in seconds
      const deltaTime = (currentTime - lastTime) / 1000
      lastTime = currentTime
      
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
        const wordWidth = wordLength(word, spacing)
        let x = centerX - wordWidth / 2
        const y = centerY
        
        word.split('').forEach(letter => {
          const letterObj = new Letter(letter, x, y)
          letterObj.draw(ctx)
          x += letterObj.width + spacing
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
  }, [])

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
    
    morphingSystemRef.current.startMorph(sourceWord, targetWord, centerX, centerY, spacing)
    setMorphingActive(true)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#000' }}>
      <canvas ref={canvasRef} width={1200} height={800} style={{ marginBottom: '20px' }}></canvas>
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
    </div>
  )
}
