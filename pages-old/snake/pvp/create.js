import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function SnakePvPCreate() {
  const [gameCode, setGameCode] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Generate a random game code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setGameCode(code)
    
    // Redirect to game with the code
    setTimeout(() => {
      router.push(`/snake/pvp/game?code=${code}`)
    }, 2000)
  }, [router])

  return (
    <>
      <Head>
        <title>Create Game - 2 Player Snake</title>
        <meta name="description" content="Create a new two player Snake game" />
        <link rel="stylesheet" type="text/css" href="/games/snake/pvp/css/landing.css" />
        <link rel="stylesheet" type="text/css" href="/games/snake/style.css" />
        <link rel="stylesheet" type="text/css" href="/res/fonts/JosefinSans.css" />
      </Head>
      
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
