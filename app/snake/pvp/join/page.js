'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function SnakePvPJoin() {
  const [gameCode, setGameCode] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get code from URL params
    const code = searchParams.get('code')
    if (code) {
      setGameCode(code)
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
    <>
      <div className="main">
        <div className="message-box">
          <h2>Joining Game...</h2>
          <p>Game code: <strong>{gameCode}</strong></p>
          <p>Connecting to game...</p>
        </div>
      </div>
    </>
  )
}
