'use client'

import { useState, useEffect } from 'react'
import Script from 'next/script'

export default function SnakePvPGame() {
  const [socketLoaded, setSocketLoaded] = useState(false)
  const [cookieLoaded, setCookieLoaded] = useState(false)
  const [texturesLoaded, setTexturesLoaded] = useState(false)
  const [gameState, setGameState] = useState('waiting') // waiting, instructions, message, playing, gameover
  const [message, setMessage] = useState('')
  const [player, setPlayer] = useState(1)
  const [gameOverText, setGameOverText] = useState('Game over!')
  const [score, setScore] = useState('Code: ...')

  useEffect(() => {
    // Expose functions to window for vanilla JS to call
    window.showInstructions = (playerNum, sideText) => {
      setPlayer(playerNum)
      setMessage(sideText)
      setGameState('instructions')
    }
    window.showMessage = (msg) => {
      setMessage(msg)
      setGameState('message')
    }
    window.hideMessageBox = () => {
      setGameState('playing')
    }
    window.showGameOver = (text) => {
      setGameOverText(text)
      setGameState('gameover')
    }
    window.updateScore = (scoreText) => {
      setScore(scoreText)
    }

    return () => {
      delete window.showInstructions
      delete window.showMessage
      delete window.hideMessageBox
      delete window.showGameOver
      delete window.updateScore
    }
  }, [])

  const handleRestart = () => {
    window.location.reload()
  }

  return (
    <>
      <Script src="/socket.io.js" strategy="afterInteractive" onLoad={() => setSocketLoaded(true)} />
      {socketLoaded && <Script src="/games/snake/pvp/js/CookieUtil.js" strategy="afterInteractive" onLoad={() => setCookieLoaded(true)} />}
      {cookieLoaded && <Script src="/games/snake/pvp/js/textures.js" strategy="afterInteractive" onLoad={() => setTexturesLoaded(true)} />}
      {texturesLoaded && <Script src="/games/snake/pvp/js/sketch.js" strategy="afterInteractive" />}
      
      <div className="main">
        {gameState !== 'playing' && (
          <div className="message-box" style={{ display: 'block' }}>
            {gameState === 'instructions' && (
              <div className="instructions">
                <p>Move using WASD or the arrow keys.</p>
                <p>Crash the other player to win.</p>
                <p>Ready up by pressing any of the keys.</p>
                <br/>
                <p style={{ fontWeight: 'bold', fontSize: '1.2em' }}>
                  {message}
                </p>
              </div>
            )}
            
            {gameState === 'message' && (
              <p style={{ fontSize: '1.5em' }}>{message}</p>
            )}
            
            {gameState === 'gameover' && (
              <>
                <p style={{ fontSize: '2em', marginBottom: '20px' }}>{gameOverText}</p>
                <button className="restart-button" onClick={handleRestart}>
                  Restart
                </button>
              </>
            )}
            
            {gameState === 'waiting' && (
              <p>Connecting to game...</p>
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
    </>
  )
}
