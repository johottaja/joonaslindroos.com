'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function JoinContent() {
  const [gameCode, setGameCode] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get code from URL params
    const code = searchParams.get('code')
    if (code) {
      setGameCode(code)
      // Store code in cookie so the game page can read it
      document.cookie = `code=${code};path=/;max-age=${30 * 24 * 60 * 60}`
      // Redirect to game with the code
      setTimeout(() => {
        router.push(`/snake/pvp/game?code=${code}`)
      }, 2000)
    } else {
      // No code provided, redirect back to landing
      router.push('/snake/pvp')
    }
  }, [router, searchParams])

  return (
    <div className="main">
      <div className="message-box" style={{ display: 'block' }}>
        <h2 style={{ marginBottom: '30px', fontSize: '2em' }}>Joining Game...</h2>
        <div style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.3)', 
          padding: '20px', 
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <p style={{ fontSize: '0.9em', marginBottom: '10px' }}>Game code:</p>
          <p style={{ 
            fontSize: '2.5em', 
            fontWeight: 'bold', 
            letterSpacing: '0.2em',
            color: '#2196F3',
            margin: '10px 0'
          }}>
            {gameCode}
          </p>
        </div>
        <p style={{ opacity: 0.7 }}>Connecting to game...</p>
      </div>
    </div>
  )
}

export default function SnakePvPJoin() {
  return (
    <Suspense fallback={<div className="main"><div className="message-box"><p>Loading...</p></div></div>}>
      <JoinContent />
    </Suspense>
  )
}
