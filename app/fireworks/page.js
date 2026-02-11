'use client'

import Script from 'next/script'

export default function Fireworks() {

  return (
    <>
      <Script src="/static/p5/p5.js" strategy="afterInteractive" />
      <Script src="/static/p5/p5.dom.js" strategy="afterInteractive" />
      <Script src="/static/games/fireworks/particles.js" strategy="afterInteractive" />
      <Script src="/static/games/fireworks/sketch.js" strategy="afterInteractive" />
      <p id="gotoOptions" className="unselectable">Press this or scroll down for options</p>
      <div className="fluid-container mContainer">
        <div className="row mRow">
          <div className="col-12">
            <div id="cs"></div>
          </div>
        </div>
        <div className="row mRow" id="options">
          <div className="col-12">
            <p className="title">OPTIONS</p>
          </div>
        </div>
        <div className="row mRow options">
          <div className="col-12 mCol">
            <form id="options-form">
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
                  <label className="form-label" htmlFor="gravity">Gravity</label>
                  <select id="gravity" className="form-control">
                    <option>Zero</option>
                    <option>Low</option>
                    <option selected>Medium</option>
                    <option>High</option>
                    <option>Extreme</option>
                  </select>
                </div>
              </div>
              <div className="row">
                <div className="form-group col-md-6 mCol">
                  <label className="form-label" htmlFor="origin">Starting point</label>
                  <select id="origin" className="form-control">
                    <option selected>Bottom</option>
                    <option>Top</option>
                    <option>Middle</option>
                    <option>Left</option>
                    <option>Right</option>
                  </select>
                </div>
                <div className="form-group col-md-6 mCol">
                  <label className="form-label" htmlFor="shootinterval">Shoot gap</label>
                  <select id="shootinterval" className="form-control">
                    <option>Very small</option>
                    <option>Small</option>
                    <option selected>Medium</option>
                    <option>Big</option>
                    <option>Very big</option>
                  </select>
                </div>
              </div>
              <div className="row">
                <div className="form-group col-md-6 mCol">
                  <label className="form-label" htmlFor="style">Style</label>
                  <select id="style" className="form-control">
                    <option selected>Default</option>
                  </select>
                </div>
                <div className="form-group col-md-6 mCol">
                  <label className="form-label" htmlFor="explosionAmount">Explosion particle Amount</label>
                  <select id="explosionAmount" className="form-control">
                    <option>Few</option>
                    <option>Some</option>
                    <option selected>Default</option>
                    <option>Many</option>
                    <option>A lot</option>
                  </select>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
