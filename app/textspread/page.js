'use client'

import Script from 'next/script'

export default function TextSpread() {

  return (
    <>
      <Script src="/opentype/opentype.js" strategy="afterInteractive" />
      <Script src="/games/textspread/algorithms.js" strategy="afterInteractive" />
      <Script src="/games/textspread/spreadfunctions.js" strategy="afterInteractive" />
      <Script src="/games/textspread/particle.js" strategy="afterInteractive" />
      <Script src="/games/textspread/textanimation.js" strategy="afterInteractive" />
      <Script src="/games/textspread/sketch.js" strategy="afterInteractive" />

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
                    <option defaultChecked>Cartoony</option>
                    <option>Crystal</option>
                    <option>Rainbow</option>
                    <option>Nature</option>
                    <option>Blue Shades</option>
                  </select>
                </div>
                <div className="form-group col-md-6 mCol">
                  <label className="form-label" htmlFor="spreadfunction">Spread Points</label>
                  <select id="spreadfunction" className="form-control">
                    <option defaultChecked>Sides</option>
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
                    <option defaultChecked>Normal</option>
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
