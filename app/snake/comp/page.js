'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'

export default function SnakeComp() {
  const router = useRouter()
  const [gameLoaded, setGameLoaded] = useState(false)
  const [texturesLoaded, setTexturesLoaded] = useState(false)
  const [gameState, setGameState] = useState('instructions') // instructions, countdown, playing, gameover, highscore
  const [message, setMessage] = useState('')
  const [score, setScore] = useState(0)
  const [finalScore, setFinalScore] = useState(0)
  const [showPodium, setShowPodium] = useState(false)
  const [formErrors, setFormErrors] = useState({ name: false, message: false })
  const formRef = useRef(null)

  useEffect(() => {
    // Expose functions to window for vanilla JS to call
    window.showInstructions = () => setGameState('instructions')
    window.showCountdown = (msg) => {
      setMessage(msg)
      setGameState('countdown')
    }
    window.startGame = () => setGameState('playing')
    window.updateScore = (newScore) => setScore(newScore)
    window.showGameOver = (gameOverData) => {
      setFinalScore(gameOverData.score)
      setShowPodium(gameOverData.podium)
      setGameState(gameOverData.podium ? 'highscore' : 'gameover')
    }

    return () => {
      delete window.showInstructions
      delete window.showCountdown
      delete window.startGame
      delete window.updateScore
      delete window.showGameOver
    }
  }, [])

  const handleLeaderboardClick = () => {
    router.push('/snake/comp/leaderboard')
  }

  const handleRestart = () => {
    window.location.reload()
  }

  const handleSubmitHighscore = async () => {
    const form = formRef.current
    const name = form.elements.name.value
    const messageText = form.elements.message.value

    const errors = {
      name: name.length < 3,
      message: messageText.length < 5
    }

    setFormErrors(errors)

    if (!errors.name && !errors.message) {
      try {
        await fetch('/api/highscores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, message: messageText, score: String(finalScore) })
        })
      } catch (err) {
        console.error('Failed to submit highscore:', err)
      }
      router.push('/snake/comp/leaderboard')
    }
  }

  return (
    <>
      <Script src="/games/snake/comp/js/game.js" strategy="afterInteractive" onLoad={() => setGameLoaded(true)} />
      {gameLoaded && <Script src="/games/snake/comp/js/textures.js" strategy="afterInteractive" onLoad={() => setTexturesLoaded(true)} />}
      {texturesLoaded && <Script src="/games/snake/comp/js/sketch.js" strategy="afterInteractive" />}
      
      <div className="main">
        {/* Message Box Overlay */}
        {gameState !== 'playing' && (
          <div className="message-box" style={{ display: 'block' }}>
            {gameState === 'instructions' && (
              <>
                <p>Move using WASD or the arrow keys</p>
                <p>Swipe controls are not supported yet.</p>
              </>
            )}
            
            {gameState === 'countdown' && (
              <p id="message-display">{message}</p>
            )}
            
            {gameState === 'gameover' && (
              <>
                <p id="game-over-text">Game over!</p>
                <p id="game-over-score-display">Final score: {finalScore}</p>
                <button className="restart-button" onClick={handleRestart}>Restart</button>
              </>
            )}
            
            {gameState === 'highscore' && (
              <>
                <p id="highscore-text">You hit a highscore!</p>
                <p id="lower-highscore-text">Give us your name and a short message.</p>
                <form ref={formRef} id="info-form">
                  {formErrors.name && (
                    <p id="bad-name-text" style={{ color: 'red' }}>
                      Name must be at least 3 characters long.
                    </p>
                  )}
                  <label className="form-label" htmlFor="name">Name</label><br/>
                  <input 
                    name="name" 
                    autoFocus 
                    maxLength={30} 
                    className="highscore-name-input" 
                    type="text" 
                    id="name"
                  /><br/>

                  {formErrors.message && (
                    <p id="bad-message-text" style={{ color: 'red' }}>
                      Message must be at least 5 characters long.
                    </p>
                  )}
                  <label className="form-label" htmlFor="message">Message</label><br/>
                  <textarea 
                    name="message" 
                    maxLength={150} 
                    className="highscore-message-input" 
                    rows={4} 
                    cols={30}
                    id="message"
                  /><br/>

                  <input 
                    className="submit-button" 
                    type="button" 
                    value="Submit" 
                    onClick={handleSubmitHighscore}
                  />
                </form>
              </>
            )}
          </div>
        )}

        <div className="score-counter-container">
          <p className="score-counter">{score}</p>
        </div>
        <div className="canvas-container">
          <canvas id="game-canvas"></canvas>
        </div>
      </div>
      
      <button 
        id="leaderboard-button" 
        className="leaderboard-button" 
        onClick={handleLeaderboardClick}
      >
        Leaderboard
      </button>
    </>
  )
}
