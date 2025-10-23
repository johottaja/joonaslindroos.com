import Head from 'next/head'
import { useEffect } from 'react'

export default function SnakePvPGame() {
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
        await loadScript('/static/games/snake/pvp/js/textures.js')
        await loadScript('/static/games/snake/pvp/js/sketch.js')
        await loadScript('/static/games/snake/pvp/js/CookieUtil.js')
      } catch (error) {
        console.error('Error loading scripts:', error)
      }
    }

    loadScripts()
  }, [])

  return (
    <>
      <Head>
        <title>2 Player Snake</title>
        <meta name="description" content="Two player Snake game by Joonas Lindroos" />
        <link rel="stylesheet" type="text/css" href="/static/games/snake/pvp/css/game.css" />
        <link rel="stylesheet" type="text/css" href="/static/games/snake/style.css" />
        <link rel="stylesheet" type="text/css" href="/static/res/fonts/JosefinSans.css" />
      </Head>
      
      <div className="main">
        <div className="message-box">
          <p>This is a message box.</p>
        </div>
        <div className="score-counter-container">
          <p className="score-counter">5</p>
        </div>
        <div className="canvas-container">
          <canvas id="game-canvas"></canvas>
        </div>
      </div>
      
      <template id="message-display-template">
        <p id="message-display"></p>
      </template>

      <template id="instructions-template">
        <div className="instructions">
          <p>Move using WASD or the arrow keys.</p>
          <p>Crash the other player to win.</p>
          <p>Ready up by pressing any of the keys.</p>
          <br/>
          <p id="instructions-sideteller"></p>
        </div>
      </template>
      
      <template id="game-over-template">
        <p id="game-over-text">Game over!</p>
        <button className="restart-button">Restart</button>
      </template>
    </>
  )
}
