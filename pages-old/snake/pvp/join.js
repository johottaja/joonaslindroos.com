import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function SnakePvPJoin() {
  const [gameCode, setGameCode] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Get code from URL params
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
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
  }, [router])

  return (
    <>
      <Head>
        <title>Join Game - 2 Player Snake</title>
        <meta name="description" content="Join a two player Snake game" />
        <link rel="stylesheet" type="text/css" href="/games/snake/pvp/css/landing.css" />
        <link rel="stylesheet" type="text/css" href="/games/snake/style.css" />
        <link rel="stylesheet" type="text/css" href="/res/fonts/JosefinSans.css" />
      </Head>
      
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
