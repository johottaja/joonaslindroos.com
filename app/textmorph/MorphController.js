import { MorphingSystem } from './morphing'
import { getResponsiveScale } from './util'
import { drawStaticWord } from './drawWord'

const HEADER_PADDING = 40

/**
 * Controls the morphing word animation: cycle scheduling, draw loop, and visibility.
 * Encapsulates refs and the MorphingSystem; notifies via onWordChange when the displayed word changes.
 */
export class MorphController {
  /**
   * @param {Object} opts
   * @param {HTMLCanvasElement} opts.canvas
   * @param {Element | null} opts.sectionElement - For IntersectionObserver
   * @param {Object} opts.config - animationConfig
   * @param {() => number} opts.getHeaderBottom
   * @param {string} opts.initialWord
   */
  constructor({ canvas, sectionElement, config, getHeaderBottom, initialWord }) {
    this.canvas = canvas
    this.sectionElement = sectionElement
    this.config = config
    this.getHeaderBottom = getHeaderBottom
    this.initialWord = initialWord

    this.ctx = null
    this.morphingSystem = null
    this.lastTime = 0
    this.morphingActive = false
    this.currentWordRef = initialWord
    this.animationFrameId = null
    this.cycleTimeoutId = null
    this.isVisible = true
    this.observer = null
  }

  start(canvasWidth, canvasHeight, headerBottom) {
    const { canvas, config } = this
    if (!canvas || canvasWidth === 0) return

    canvas.width = canvasWidth
    canvas.height = canvasHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.translate(config.canvasTranslateOffset, config.canvasTranslateOffset)
    this.ctx = ctx

    if (!this.morphingSystem) {
      this.morphingSystem = new MorphingSystem()
      this.morphingSystem.sourceWord = this.initialWord
    }
    const morphingSystem = this.morphingSystem
    const responsiveScale = getResponsiveScale(canvasWidth)

    this.lastTime = performance.now()

    ctx.fillStyle = config.canvas.fillStyle
    ctx.strokeStyle = config.canvas.strokeStyle
    ctx.lineCap = config.canvas.lineCap
    ctx.lineWidth = config.canvas.lineWidth * responsiveScale

    const spacing = config.spacing
    const centerX = canvas.width / 2
    const maxWidth = canvas.width * 0.9

    const scheduleCycle = () => {
      if (this.cycleTimeoutId) clearTimeout(this.cycleTimeoutId)
      this.cycleTimeoutId = setTimeout(() => {
        if (!this.isVisible || !this.canvas || !this.morphingSystem) return
        const ty = this.getHeaderBottom() + HEADER_PADDING
        const cx = this.canvas.width / 2
        const current = this.morphingSystem.getCurrentWord() || this.initialWord
        const currentIndex = this.config.words.findIndex(w => w === current.toUpperCase())
        const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % this.config.words.length
        const targetWord = this.config.words[nextIndex]
        if (current.toUpperCase() !== targetWord.toUpperCase()) {
          this.morphingSystem.startMorph(
            current, targetWord, cx, ty,
            this.config.spacing, getResponsiveScale(this.canvas.width),
            this.canvas.width * 0.9
          )
          if (!this.animationFrameId && this._draw) {
            this.lastTime = performance.now()
            this.animationFrameId = requestAnimationFrame(this._draw)
          }
          this.morphingActive = true
        }
      }, config.displayDuration)
    }

    const draw = (currentTime) => {
      if (!this.isVisible) return

      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const rawDelta = (currentTime - this.lastTime) / config.deltaTimeMultiplier
      const deltaTime = Math.min(rawDelta, 0.1)
      this.lastTime = currentTime

      morphingSystem.scale = responsiveScale

      if (morphingSystem.morphs && morphingSystem.morphs.length > 0) {
        morphingSystem.update(currentTime, deltaTime)
        morphingSystem.draw(ctx)

        if (morphingSystem.isActive()) {
          this.morphingActive = true
        } else {
          if (this.morphingActive) {
            this.morphingActive = false
            scheduleCycle()
          }
          this._syncWordAndMaybeStop()
          if (morphingSystem.isSettled()) {
            this.animationFrameId = null
            return
          }
        }
      } else {
        if (this.morphingActive) {
          this.morphingActive = false
          scheduleCycle()
        }
        this._syncWordAndMaybeStop()

        const word = morphingSystem.getCurrentWord() || this.initialWord
        const textTopY = this.getHeaderBottom() + HEADER_PADDING
        const currentScale = morphingSystem.scale || responsiveScale
        const lineHeight = 140 * currentScale

        drawStaticWord(ctx, word, {
          centerX,
          startY: textTopY,
          scale: currentScale,
          spacing,
          maxWidth,
          lineHeight,
          defaultLetterWidth: config.defaultLetterWidth
        })

        this.animationFrameId = null
        return
      }

      this.animationFrameId = requestAnimationFrame(draw)
    }

    this._draw = draw
    this._scheduleCycle = scheduleCycle
    this._syncWordAndMaybeStop = () => {
      const word = morphingSystem.getCurrentWord() || this.initialWord
      if (word !== this.currentWordRef) {
        this.currentWordRef = word
      }
    }

    draw(performance.now())
    scheduleCycle()

    if (this.sectionElement) {
      this.observer = new IntersectionObserver(
        ([entry]) => {
          const wasVisible = this.isVisible
          this.isVisible = entry.isIntersecting
          if (entry.isIntersecting && !wasVisible) {
            this.lastTime = performance.now()
            draw(performance.now())
          }
        },
        { threshold: 0 }
      )
      this.observer.observe(this.sectionElement)
    }
  }

  stop() {
    if (this.observer && this.sectionElement) {
      this.observer.disconnect()
      this.observer = null
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
    if (this.cycleTimeoutId) {
      clearTimeout(this.cycleTimeoutId)
      this.cycleTimeoutId = null
    }
  }
}
