'use client'

import { useState } from 'react'
import Script from 'next/script'

export default function SnakePvPLocal() {
  const [configLoaded, setConfigLoaded] = useState(false)
  const [snakeLoaded, setSnakeLoaded] = useState(false)
  const [gameLoaded, setGameLoaded] = useState(false)

  return (
    <>
      <Script src="/games/snake/pvp/local/js/config.js" strategy="afterInteractive" onLoad={() => setConfigLoaded(true)} />
      {configLoaded && <Script src="/games/snake/pvp/local/js/snake.js" strategy="afterInteractive" onLoad={() => setSnakeLoaded(true)} />}
      {snakeLoaded && <Script src="/games/snake/pvp/local/js/game.js" strategy="afterInteractive" onLoad={() => setGameLoaded(true)} />}
      {gameLoaded && <Script src="/games/snake/pvp/local/js/sketch.js" strategy="afterInteractive" />}
      <div className="main">
        <div className="message-box">
          <p>This is a message box.</p>
        </div>
        <div className="score-counter-container">
          <p className="score-counter">5 - 5</p>
        </div>
        <div className="canvas-container">
          <canvas id="game-canvas"></canvas>
        </div>
      </div>
      
      <template id="instructions-template">
        <div className="instructions">
          <p>Crash the other player to win.</p>
          <p>Ready up by pressing any of the keys.</p>
          <br/>
          <p style={{ color: 'red' }} id="player1-ready">Purple (WASD) </p>
          <p style={{ color: 'red' }} id="player2-ready">Yellow (Arrow keys)</p>
        </div>
        <div className="timer" style={{ display: 'none' }}>
          <span id="game-start-timer">3</span>
        </div>
      </template>
      
      <template id="game-over-template">
        <p id="game-over-text">Game over!</p>
        <button className="restart-button" onClick={() => window.location.reload()}>Restart</button>
      </template>
    </>
  )
}
