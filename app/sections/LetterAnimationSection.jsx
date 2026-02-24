'use client'

import { useEffect, useRef, useState } from 'react'
import { MorphController } from '@/textmorph/MorphController'
import { animationConfig } from '@/textmorph/LetterAnimation.config'
import TexturedText from '@/components/TexturedText.jsx'

const initialWord = animationConfig.words[0]

export default function LetterAnimationSection() {
  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
  const headerRef = useRef(null)
  const headerBottomRef = useRef(0)
  const controllerRef = useRef(null)

  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const [headerBottom, setHeaderBottom] = useState(0)

  useEffect(() => {
    const updateCanvasSize = () => {
      if (typeof window !== 'undefined') {
        setCanvasSize({
          width: document.documentElement.clientWidth,
          height: window.innerHeight
        })
        if (headerRef.current) {
          const rect = headerRef.current.getBoundingClientRect()
          setHeaderBottom(rect.bottom)
          headerBottomRef.current = rect.bottom
        }
      }
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)
    return () => window.removeEventListener('resize', updateCanvasSize)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || canvasSize.width === 0) return

    const controller = new MorphController({
      canvas,
      sectionElement: sectionRef.current,
      config: animationConfig,
      getHeaderBottom: () => headerBottomRef.current,
      initialWord
    })
    controllerRef.current = controller
    controller.start(canvasSize.width, canvasSize.height, headerBottom)

    return () => {
      controller.stop()
      controllerRef.current = null
    }
  }, [canvasSize, headerBottom])

  return (
    <div ref={sectionRef} className="flex flex-col justify-center items-center w-full bg-black relative h-screen translate-z-0.5 backface-hidden">
      <svg
        className="absolute top-0 left-0 w-full z-50"
        height="34"
        width="100%"
        viewBox="0 0 100 35"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <polyline
          points="0,0 50,34 100,0 100,-10 0,-10"
          fill="#0a0a0a"
          stroke="#a3a3a3"
          strokeWidth="5"
        />
      </svg>
      <h2
        ref={headerRef}
        className="text-white text-5xl lg:text-7xl z-10 absolute tracking-widest top-60 text-center"
      >
        <TexturedText>
          Interested and Competent in
        </TexturedText>
      </h2>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="block"
        style={{
          width: canvasSize.width > 0 ? `${canvasSize.width}px` : '100%',
          height: canvasSize.height > 0 ? `${canvasSize.height}px` : '100vh',
          transform: 'translateZ(0)'
        }}
      />
      <div
        className="absolute top-0 left-0 w-full h-full -z-50"
        style={{
          background: 'linear-gradient(0deg, #fff2 0%, #0000 30%)',
          opacity: 0.7,
          pointerEvents: 'none',
          zIndex: 10,
        }}
      />
      <div
        className="absolute top-0 left-0 w-full h-full -z-50"
        style={{
          background: 'linear-gradient(180deg, #fff2 0%, #0000 30%)',
          opacity: 0.7,
          pointerEvents: 'none',
          zIndex: 10,
        }}
      />
    </div>
  )
}
