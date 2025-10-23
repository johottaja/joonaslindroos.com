'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SnakeComp() {
  const router = useRouter()

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
        await loadScript('/static/games/snake/comp/js/textures.js')
        await loadScript('/static/games/snake/comp/js/sketch.js')
      } catch (error) {
        console.error('Error loading scripts:', error)
      }
    }

    loadScripts()

    // Handle leaderboard button click
    const handleLeaderboardClick = () => {
      router.push('/snake/comp/leaderboard')
    }

    const leaderboardButton = document.getElementById('leaderboard-button')
    if (leaderboardButton) {
      leaderboardButton.onclick = handleLeaderboardClick
    }
  }, [router])

  return (
    <>
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
      <button id="leaderboard-button" className="leaderboard-button">Leaderboard</button>
      
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
        <form method="post" action="/api/highscores" id="info-form">
          <p id="bad-name-text">Name must be at least 3 characters long.</p>
          <label className="form-label" htmlFor="name">Name</label><br/>
          <input name="name" autoFocus maxLength="30" className="highscore-name-input" type="text" id="name"/><br/>

          <p id="bad-message-text">Message must be at least 5 characters long.</p>
          <label className="form-label" htmlFor="message">Message</label><br/>
          <textarea name="message" maxLength="150" className="highscore-message-input" rows="4" cols="30"
                    id="message"></textarea><br/>

          <label htmlFor="score"></label>
          <input name="score" readOnly id="score" style={{ display: 'none' }}/>

          <input className="submit-button" type="button" value="Submit" id="info-submit-button"/>
        </form>
      </template>
    </>
  )
}
