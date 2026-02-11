'use client'

import { useState, useEffect } from 'react'
import Script from 'next/script'

export default function SnakePvPLocal() {
  const [configLoaded, setConfigLoaded] = useState(false)
  const [snakeLoaded, setSnakeLoaded] = useState(false)
  const [gameLoaded, setGameLoaded] = useState(false)
  const [gameState, setGameState] = useState('instructions') // instructions, countdown, playing, gameover
  const [player1Ready, setPlayer1Ready] = useState(false)
  const [player2Ready, setPlayer2Ready] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const [gameOverText, setGameOverText] = useState('Game over!')
  const [score, setScore] = useState('0 - 0')

  useEffect(() => {
    // Expose functions to window for vanilla JS to call
    window.showInstructions = () => {
      setGameState('instructions')
      setPlayer1Ready(false)
      setPlayer2Ready(false)
    }
    window.setPlayer1Ready = (ready) => setPlayer1Ready(ready)
    window.setPlayer2Ready = (ready) => setPlayer2Ready(ready)
    window.startCountdown = () => {
      setGameState('countdown')
      setCountdown(3)
    }
    window.updateCountdown = (num) => setCountdown(num)
    window.hideMessageBox = () => setGameState('playing')
    window.showGameOver = (text) => {
      setGameOverText(text)
      setGameState('gameover')
    }
    window.updateScore = (scoreText) => setScore(scoreText)

    return () => {
      delete window.showInstructions
      delete window.setPlayer1Ready
      delete window.setPlayer2Ready
      delete window.startCountdown
      delete window.updateCountdown
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
      <Script src="/games/snake/pvp/local/js/config.js" strategy="afterInteractive" onLoad={() => setConfigLoaded(true)} />
      {configLoaded && <Script src="/games/snake/pvp/local/js/snake.js" strategy="afterInteractive" onLoad={() => setSnakeLoaded(true)} />}
      {snakeLoaded && <Script src="/games/snake/pvp/local/js/game.js" strategy="afterInteractive" onLoad={() => setGameLoaded(true)} />}
      {gameLoaded && <Script src="/games/snake/pvp/local/js/sketch.js" strategy="afterInteractive" />}
      
      <div className="main">
        {gameState !== 'playing' && (
          <div className="message-box" style={{ display: 'block' }}>
            {gameState === 'instructions' && (
              <div className="instructions">
                <p>Crash the other player to win.</p>
                <p>Ready up by pressing any of the keys.</p>
                <br/>
                <p style={{ color: player1Ready ? 'green' : 'red', fontWeight: 'bold' }}>
                  Purple (WASD) {player1Ready && '✓'}
                </p>
                <p style={{ color: player2Ready ? 'green' : 'red', fontWeight: 'bold' }}>
                  Yellow (Arrow keys) {player2Ready && '✓'}
                </p>
              </div>
            )}
            
            {gameState === 'countdown' && (
              <div className="timer">
                <span style={{ fontSize: '3em', fontWeight: 'bold' }}>{countdown}</span>
              </div>
            )}
            
            {gameState === 'gameover' && (
              <>
                <p style={{ fontSize: '2em', marginBottom: '20px' }}>{gameOverText}</p>
                <button className="restart-button" onClick={handleRestart}>
                  Restart
                </button>
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
    </>
  )
}
