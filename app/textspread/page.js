'use client'

import { useEffect } from 'react'

export default function TextSpread() {
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
        await loadScript('/static/opentype/opentype.js')
        await loadScript('/static/games/textspread/algorithms.js')
        await loadScript('/static/games/textspread/spreadfunctions.js')
        await loadScript('/static/games/textspread/particle.js')
        await loadScript('/static/games/textspread/textanimation.js')
        await loadScript('/static/games/textspread/sketch.js')
      } catch (error) {
        console.error('Error loading scripts:', error)
      }
    }

    loadScripts()
  }, [])

  return (
    <>
      <p id="gotoOptions" className="unselectable">Press this or scroll down for options.</p>
      <div className="fluid-container mContainer">
        <div className="row mRow">
          <div className="col-12">
            <div id="cs">
              <canvas id="canvas"></canvas>
            </div>
          </div>
        </div>
        <div className="row mRow" id="options">
          <div className="col-12">
            <p className="title">OPTIONS</p>
          </div>
        </div>
        <div className="row mRow options">
          <div className="col-12 mCol">
            <form>
              <div className="row">
                <div className="form-group col-md-6 mCol">
                  <label className="form-label" htmlFor="colorscheme">Color Scheme</label>
                  <select id="colorscheme" className="form-control">
                    <option selected>Cartoony</option>
                    <option>Crystal</option>
                    <option>Rainbow</option>
                    <option>Nature</option>
                    <option>Blue Shades</option>
                  </select>
                </div>
                <div className="form-group col-md-6 mCol">
                  <label className="form-label" htmlFor="spreadfunction">Spread Points</label>
                  <select id="spreadfunction" className="form-control">
                    <option selected>Sides</option>
                    <option>Spiral</option>
                    <option>Double Spiral</option>
                    <option>Bottom</option>
                  </select>
                </div>
              </div>
              <div className="row">
                <div className="form-group col-md-6 mCol">
                  <label className="form-label" htmlFor="textinput">Text</label>
                  <input className="form-control" type="text" maxLength="50" placeholder="TEXT HERE" id="textinput"/>
                </div>
                <div className="form-group col-md-6 mCol">
                  <label className="form-label" htmlFor="style">Style</label>
                  <select id="style" className="form-control">
                    <option selected>Normal</option>
                    <option>Straight</option>
                    <option>Wavey</option>
                    <option>Orderly</option>
                    <option>Smooth</option>
                    <option>Smooth Waves</option>
                  </select>
                </div>
              </div>
              <div className="row justify-content-center">
                <p style={{ color: '#828282' }} className="text-center mb-0 mt-4">Click and hold on the animation to
                  see magic.</p>
                <button id="startbutton" className="start-btn btn btn-primary">Play Animation</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
