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
    <>
      <div className="main">
        <div className="message-box">
          <h2>Creating Game...</h2>
          <p>Your game code is: <strong>{gameCode}</strong></p>
          <p>Share this code with your opponent.</p>
          <p>Redirecting to game...</p>
        </div>
      </div>
    </>
  )
}
