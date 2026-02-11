'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'

export default function SnakeComp() {
  const router = useRouter()
  const [gameLoaded, setGameLoaded] = useState(false)
  const [texturesLoaded, setTexturesLoaded] = useState(false)

  const handleLeaderboardClick = () => {
    router.push('/snake/comp/leaderboard')
  }

  return (
    <>
      <Script src="/games/snake/comp/js/game.js" strategy="afterInteractive" onLoad={() => setGameLoaded(true)} />
      {gameLoaded && <Script src="/games/snake/comp/js/textures.js" strategy="afterInteractive" onLoad={() => setTexturesLoaded(true)} />}
      {texturesLoaded && <Script src="/games/snake/comp/js/sketch.js" strategy="afterInteractive" />}
      <div className="main">
        <div className="message-box">
          <p>This is a message box.</p>
        </div>
        <div className="score-counter-container">
          <p className="score-counter">0</p>
        </div>
        <div className="canvas-container">
          <canvas id="game-canvas"></canvas>
        </div>
      </div>
      <button id="leaderboard-button" className="leaderboard-button" onClick={handleLeaderboardClick}>Leaderboard</button>
      
      <template id="instructions-template">
        <p>Move using WASD or the arrow keys</p>
        <p>Swipe controls are not supported yet.</p>
      </template>
      <template id="message-display-template">
        <p id="message-display"></p>
      </template>
      <template id="game-over-template">
        <p id="game-over-text">Game over!</p>
        <p id="game-over-score-display">Final score: 0</p>
        <button className="restart-button">Restart</button>
      </template>
      <template id="highscore-submit-template">
        <p id="highscore-text">You hit a highscore!</p>
        <p id="lower-highscore-text">Give us your name and a short message.</p>
        <form id="info-form">
          <p id="bad-name-text">Name must be at least 3 characters long.</p>
          <label className="form-label" htmlFor="name">Name</label><br/>
          <input name="name" autoFocus maxLength="30" className="highscore-name-input" type="text" id="name"/><br/>

          <p id="bad-message-text">Message must be at least 5 characters long.</p>
          <label className="form-label" htmlFor="message">Message</label><br/>
          <textarea name="message" maxLength="150" className="highscore-message-input" rows="4" cols="30"
                    id="message"></textarea><br/>

          <input name="score" readOnly id="score" style={{ display: 'none' }}/>

          <input className="submit-button" type="button" value="Submit" id="info-submit-button"/>
        </form>
      </template>
    </>
  )
}
