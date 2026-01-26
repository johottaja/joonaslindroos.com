
const letterWidths = {
    'A': 60, 'B': 50, 'C': 60, 'D': 60, 'E': 50, 'F': 50, 'G': 60,
    'H': 50, 'I': 20, 'J': 40, 'K': 50, 'L': 50, 'M': 80, 'N': 60,
    'O': 60, 'P': 50, 'Q': 60, 'R': 50, 'S': 50, 'T': 60, 'U': 60,
    'V': 80, 'W': 100, 'X': 60, 'Y': 60, 'Z': 60, ' ': 100,
  }
  
  class Letter {
    constructor(letter, x, y) {
      this.letter = letter
      this.x = x
      this.y = y
      this.shapes = letterDefinitions[letter]
      this.width =  letterWidths[letter]
    }
  
    draw(ctx) {
      this.shapes.forEach(shape => shape.draw(ctx, this.x, this.y))
    }
  }
  
  class Line {
    constructor(x1, y1, dir, length) {
      this.x = x1
      this.y = y1
      this.dir = dir
      this.length = length
    }
  
    draw(ctx, offsetX, offsetY) {
      ctx.beginPath()
      ctx.moveTo(this.x + offsetX, this.y + offsetY)
      ctx.lineTo(this.x + offsetX + this.length * Math.cos(this.dir), this.y + offsetY + this.length * Math.sin(this.dir))
      ctx.stroke()
    }
  }
  
  class Curve {
    constructor(x1, y1, x2, y2, x3, y3) {
      this.x1 = x1
      this.y1 = y1
      this.x2 = x2
      this.y2 = y2
      this.x3 = x3
      this.y3 = y3
    }
  
    draw(ctx, offsetX, offsetY) {
      ctx.beginPath()
      ctx.moveTo(this.x1 + offsetX, this.y1 + offsetY)
      ctx.quadraticCurveTo(this.x2 + offsetX, this.y2 + offsetY, this.x3 + offsetX, this.y3 + offsetY)
      ctx.stroke()
    }
  }
  
  const PI = Math.PI
  
  const letterDefinitions = {
    'A': [
      new Line(0, 100, Math.atan2(-100, 30), Math.sqrt(30*30 + 100*100)),
      new Line(60, 100, Math.atan2(-100, -30), Math.sqrt(30*30 + 100*100)),
      new Line(14, 50, 0, 32),
    ],
    'B': [
      new Line(0, 0, PI / 2, 100),
      new Curve(0, 0, 50, 0, 50, 25),
      new Curve(50, 25, 50, 50, 0, 50),
      new Curve(0, 50, 50, 50, 50, 75),
      new Curve(50, 75, 50, 100, 0, 100),
    ],
    'C': [
      new Curve(60, 0, 0, 0, 0, 60),
      new Curve(0, 60, 0, 100, 60, 100),
    ],
    'D': [
      new Line(0, 0, PI / 2, 100),
      new Curve(0, 0, 60, 0, 60, 50),
      new Curve(60, 50, 60, 100, 0, 100),
    ],
    'E': [
      new Line(0, 0, PI / 2, 100),
      new Line(0, 0, 0, 50),
      new Line(0, 50, 0, 40),
      new Line(0, 100, 0, 50),
    ],
    'F': [
      new Line(0, 0, PI / 2, 100),
      new Line(0, 0, 0, 50),
      new Line(0, 50, 0, 40),
    ],
    'G': [
      new Curve(60, 0, 0, 0, 0, 60),
      new Curve(0, 60, 0, 100, 60, 100),
      new Line(60, 100, 3*PI/2, 50),
      new Line(30, 50, 0, 30),
    ],
    'H': [
      new Line(0, 0, PI / 2, 100),
      new Line(50, 0, PI / 2, 100),
      new Line(0, 50, 0, 50),
    ],
    'I': [
      new Line(10, 0, PI / 2, 100),
    ],
    'J': [
      new Line(30, 0, PI / 2, 80),
      new Curve(30, 80, 30, 100, 10, 100),
      new Curve(10, 100, 0, 100, 0, 90),
    ],
    'K': [
      new Line(0, 0, PI / 2, 100),
      new Line(0, 50, Math.atan2(-50, 50), Math.sqrt(50*50 + 50*50)),
      new Line(0, 50, Math.atan2(50, 50), Math.sqrt(50*50 + 50*50)),
    ],
    'L': [
      new Line(0, 0, PI / 2, 100),
      new Line(0, 100, 0, 50),
    ],
    'M': [
      new Line(0, 0, PI / 2, 100),
      new Line(80, 0, PI / 2, 100),
      new Line(0, 0, Math.atan2(100, 40), Math.sqrt(40*40 + 100*100)),
      new Line(80, 0, Math.atan2(100, -40), Math.sqrt(40*40 + 100*100)),
    ],
    'N': [
      new Line(0, 0, PI / 2, 100),
      new Line(60, 0, PI / 2, 100),
      new Line(0, 0, Math.atan2(100, 60), Math.sqrt(60*60 + 100*100)),
    ],
    'O': [
      new Curve(30, 0, 0, 0, 0, 50),
      new Curve(0, 50, 0, 100, 30, 100),
      new Curve(30, 100, 60, 100, 60, 50),
      new Curve(60, 50, 60, 0, 30, 0),
    ],
    'P': [
      new Line(0, 0, PI / 2, 100),
      new Curve(0, 0, 50, 0, 50, 25),
      new Curve(50, 25, 50, 50, 0, 50),
    ],
    'Q': [
      new Curve(30, 0, 0, 0, 0, 50),
      new Curve(0, 50, 0, 100, 30, 100),
      new Curve(30, 100, 60, 100, 60, 50),
      new Curve(60, 50, 60, 0, 30, 0),
      new Line(40, 70, Math.atan2(30, 30), Math.sqrt(30*30 + 30*30)),
    ],
    'R': [
      new Line(0, 0, PI / 2, 100),
      new Curve(0, 0, 50, 0, 50, 25),
      new Curve(50, 25, 50, 50, 0, 50),
      new Line(0, 50, Math.atan2(50, 50), Math.sqrt(50*50 + 50*50)),
    ],
    'S': [
      new Curve(50, 0, 0, 0, 0, 25),
      new Curve(0, 25, 0, 50, 25, 50),
      new Curve(25, 50, 50, 50, 50, 75),
      new Curve(50, 75, 50, 100, 0, 100),
    ],
    'T': [
      new Line(30, 0, PI / 2, 100),
      new Line(0, 0, 0, 60),
    ],
    'U': [
      new Line(0, 0, PI / 2, 80),
      new Curve(0, 80, 0, 100, 30, 100),
      new Curve(30, 100, 60, 100, 60, 80),
      new Line(60, 0, PI / 2, 80),
    ],
    'V': [
      new Line(0, 0, Math.atan2(100, 40), Math.sqrt(40*40 + 100*100)),
      new Line(80, 0, Math.atan2(100, -40), Math.sqrt(40*40 + 100*100)),
    ],
    'W': [
      new Line(0, 0, PI / 2, 100),
      new Line(100, 0, PI / 2, 100),
      new Line(0, 100, Math.atan2(-30, 50), Math.sqrt(50*50 + 30*30)),
      new Line(100, 100, Math.atan2(-30, -50), Math.sqrt(50*50 + 30*30)),
    ],
    'X': [
      new Line(0, 0, Math.atan2(100, 60), Math.sqrt(60*60 + 100*100)),
      new Line(60, 0, Math.atan2(100, -60), Math.sqrt(60*60 + 100*100)),
    ],
    'Y': [
      new Line(0, 0, Math.atan2(50, 30), Math.sqrt(30*30 + 50*50)),
      new Line(60, 0, Math.atan2(50, -30), Math.sqrt(30*30 + 50*50)),
      new Line(30, 50, PI / 2, 50),
    ],
    'Z': [
      new Line(0, 0, 0, 60),
      new Line(0, 0, Math.atan2(100, 60), Math.sqrt(60*60 + 100*100)),
      new Line(60, 100, PI, 60),
    ],
    ' ': [
    ],
}

function wordLength(word, spacing) {
    return word.split('').reduce((total, letter) => {
        return total + (letterWidths[letter] || 50) + spacing
    }, 0) - spacing // Remove last spacing
}

export { letterWidths, letterDefinitions, Letter, Line, Curve, wordLength }