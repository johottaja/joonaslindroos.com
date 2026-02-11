'use client'

import { useState } from 'react'
import Script from 'next/script'

export default function SnakePvPGame() {
  const [socketLoaded, setSocketLoaded] = useState(false)
  const [cookieLoaded, setCookieLoaded] = useState(false)
  const [texturesLoaded, setTexturesLoaded] = useState(false)

  return (
    <>
      <Script src="/snake/pvp/socket/socket.io.js" strategy="afterInteractive" onLoad={() => setSocketLoaded(true)} />
      {socketLoaded && <Script src="/games/snake/pvp/js/CookieUtil.js" strategy="afterInteractive" onLoad={() => setCookieLoaded(true)} />}
      {cookieLoaded && <Script src="/games/snake/pvp/js/textures.js" strategy="afterInteractive" onLoad={() => setTexturesLoaded(true)} />}
      {texturesLoaded && <Script src="/games/snake/pvp/js/sketch.js" strategy="afterInteractive" />}
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
        <button className="restart-button" onClick={() => window.location.reload()}>Restart</button>
      </template>
    </>
  )
}
