'use client'

import { useEffect } from 'react'

export default function SnakePvPLocal() {
  useEffect(() => {
    // Load external scripts
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = src
        script.async = true
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })
    }

    const loadScripts = async () => {
      try {
        await loadScript('/static/games/snake/pvp/local/js/config.js')
        await loadScript('/static/games/snake/pvp/local/js/snake.js')
        await loadScript('/static/games/snake/pvp/local/js/game.js')
        await loadScript('/static/games/snake/pvp/local/js/sketch.js')
      } catch (error) {
        console.error('Error loading scripts:', error)
      }
    }

    loadScripts()
  }, [])

  return (
    <>
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
        <button className="restart-button" type="submit">Restart</button>
      </template>
    </>
  )
}
