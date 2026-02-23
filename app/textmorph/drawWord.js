import { letterWidths, letterDefinitions, Line, Curve, wordLength, Vector } from './letters'
import { splitIntoLines } from './util'

/**
 * Draw a static word (possibly multi-line) on the canvas.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} word
 * @param {Object} opts
 * @param {number} opts.centerX - X center of the first line
 * @param {number} opts.startY - Y position of the first line
 * @param {number} opts.scale
 * @param {number} opts.spacing
 * @param {number} opts.maxWidth - Max width for line wrapping
 * @param {number} opts.lineHeight - Vertical spacing between lines
 * @param {number} opts.defaultLetterWidth - Fallback width for unknown chars
 */
export function drawStaticWord(ctx, word, opts) {
  const {
    centerX,
    startY,
    scale,
    spacing,
    maxWidth,
    lineHeight = 140 * scale,
    defaultLetterWidth = 50
  } = opts

  const scaledSpacing = spacing * scale
  const lines = splitIntoLines(word, maxWidth, spacing, scale)

  lines.forEach((line, lineIndex) => {
    const lineWidth = wordLength(line, spacing) * scale
    let x = centerX - lineWidth / 2
    const y = startY + lineIndex * lineHeight

    line.split('').forEach(letter => {
      const letterWidth = (letterWidths[letter] || defaultLetterWidth) * scale
      const letterShapes = letterDefinitions[letter] || []

      letterShapes.forEach(shape => {
        if (shape instanceof Line) {
          const start = shape.position.multiply(scale).add(new Vector(x, y))
          const direction = Vector.fromAngle(shape.dir, shape.length * scale)
          const end = start.add(direction)
          ctx.beginPath()
          ctx.moveTo(start.x, start.y)
          ctx.lineTo(end.x, end.y)
          ctx.stroke()
        } else if (shape instanceof Curve) {
          const p1 = shape.p1.multiply(scale).add(new Vector(x, y))
          const p2 = shape.p2.multiply(scale).add(new Vector(x, y))
          const p3 = shape.p3.multiply(scale).add(new Vector(x, y))
          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.quadraticCurveTo(p2.x, p2.y, p3.x, p3.y)
          ctx.stroke()
        }
      })

      x += letterWidth + scaledSpacing
    })
  })
}
