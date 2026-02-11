'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SnakePvPCreate() {
  const [gameCode, setGameCode] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Generate a random game code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setGameCode(code)

    // Store code in cookie so the game page can read it
    document.cookie = `code=${code};path=/;max-age=${30 * 24 * 60 * 60}`
    
    // Redirect to game with the code
    setTimeout(() => {
      router.push(`/snake/pvp/game?code=${code}`)
    }, 2000)
  }, [router])

  return (
    <div className="main">
      <div className="message-box" style={{ display: 'block' }}>
        <h2 style={{ marginBottom: '30px', fontSize: '2em' }}>Creating Game...</h2>
        <div style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.3)', 
          padding: '20px', 
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <p style={{ fontSize: '0.9em', marginBottom: '10px' }}>Your game code is:</p>
          <p style={{ 
            fontSize: '2.5em', 
            fontWeight: 'bold', 
            letterSpacing: '0.2em',
            color: '#4CAF50',
            margin: '10px 0'
          }}>
            {gameCode}
          </p>
        </div>
        <p style={{ fontSize: '1.1em', marginBottom: '10px' }}>
          Share this code with your opponent.
        </p>
        <p style={{ opacity: 0.7 }}>Redirecting to game...</p>
      </div>
    </div>
  )
}
