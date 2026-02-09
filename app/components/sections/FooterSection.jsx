'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useWindowSize, useDebounce } from "@uidotdev/usehooks"
import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'

gsap.registerPlugin(MotionPathPlugin)

const NAME = "Joonas Lindroos"

export default function FooterSection() {
  const sectionRef = useRef(null)
  const lettersRef = useRef([])
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  })
  
  // Calculate parallax based on scroll progress through the section
  const mountains2Y = useTransform(scrollYProgress, [0, 1], [150, 0])
  const mountains1Y = useTransform(scrollYProgress, [0, 1], [200, 0])
  const groundY = useTransform(scrollYProgress, [0, 1], [450, 0])
  const textY = useTransform(scrollYProgress, [0, 1], [0, -100])

  useEffect(() => {
    const letters = lettersRef.current.filter(Boolean)
    if (letters.length === 0) return

    const duration = 3
    const width = window.innerWidth * 0.45
    const height = window.innerHeight * 0.35
    const staggerDelay = 0.10

    // Forward path: right to left (lower arc)
    const forwardPath = `M ${-width} ${height} Q 0 ${-height} ${width} ${height}`
    // Return path: left to right (higher arc, ends higher)
    const returnHeight = height * 0.6
    const returnPeak = height * 1.3
    const returnPath = `M ${-width} ${returnHeight} Q 0 ${-returnPeak} ${width} ${returnHeight}`
    // Third path: right to far left (very high arc)
    const farWidth = width * 1.5
    const veryHighPeak = height * 3
    const thirdPath = `M ${width} ${returnHeight} Q 0 ${-veryHighPeak} ${-farWidth} ${height * 0.8}`
    // Fourth path: top left, goes very high, then down to bottom right
    const fourthPath = `M ${-farWidth} ${height * 0.8} Q 0 ${-veryHighPeak} ${farWidth / 2} ${height * 2}`

    letters.forEach((letter, index) => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 2, delay: index * staggerDelay })

      // Start: right to center (forward path)
      tl.call(() => { letter.style.zIndex = -50 })
      .set(letter, { scale: 4 })
      .to(letter, {
        motionPath: {
          path: forwardPath,
          autoRotate: 180,
          start: 1,
          end: 0.5
        },
        duration: duration / 4,
        ease: "none",
        scale: 2.2
      })
      // Snap z-index at center, then center to left
      .call(() => { letter.style.zIndex = -70 })
      .to(letter, {
        motionPath: {
          path: forwardPath,
          autoRotate: 180,
          start: 0.5,
          end: 0
        },
        duration: duration / 4,
        ease: "none",
        scale: 1
      })
      // Left to center (return path - higher)
      .call(() => { letter.style.zIndex = -70 })
      .to(letter, {
        motionPath: {
          path: returnPath,
          autoRotate: 180,
          start: 0,
          end: 0.5
        },
        duration: duration / 2,
        ease: "none",
        scale: 0.5
      })
      // Snap z-index at center, then center to right
      .call(() => { letter.style.zIndex = -90 })
      .to(letter, {
        motionPath: {
          path: returnPath,
          autoRotate: 180,
          start: 0.5,
          end: 1
        },
        duration: duration / 2,
        ease: "none",
        scale: 0.3
      })
      // Third loop: right to far left (very high arc)
      .to(letter, {
        motionPath: {
          path: thirdPath,
          autoRotate: 180,
          start: 0,
          end: 1
        },
        duration: duration,
        ease: "none"
      })
      // Fourth loop: top left to center
      .to(letter, {
        motionPath: {
          path: fourthPath,
          autoRotate: 180,
          start: 0,
          end: 0.5,
          scale: 3
        },
        duration: duration / 2,
        ease: "none"
      })
      // Snap z-index at center, then center to bottom right
      .call(() => { letter.style.zIndex = -50 })
      .to(letter, {
        motionPath: {
          path: fourthPath,
          autoRotate: 180,
          start: 0.5,
          end: 1
        },
        duration: duration / 2,
        ease: "none",
        scale: 4
      })
    })

    return () => {
      letters.forEach(letter => gsap.killTweensOf(letter))
    }
  }, [])

  return (
    <section ref={sectionRef} className="w-screen h-[300vh] relative">
        <div className="w-screen h-screen sticky top-0">
          <img 
            src="/images/sysiphus_footer/sky.png" 
            alt="Background" 
            className="w-full h-screen object-cover absolute top-0 left-0 -z-100" 
          />
          <motion.img 
            src="/images/sysiphus_footer/mountains2.png" 
            alt="Background" 
            className="w-full h-screen object-cover absolute bottom-0 left-0 -z-80"
            style={{ y: mountains2Y }}
          />
          <motion.img 
            src="/images/sysiphus_footer/mountains1.png" 
            alt="Background" 
            className="w-full h-screen object-cover absolute bottom-0 left-0 -z-60"
            style={{ y: mountains1Y }}
          />
          <motion.img 
            src="/images/sysiphus_footer/ground.png" 
            alt="Background" 
            className="w-full h-screen object-cover absolute bottom-0 left-0 -z-40"
            style={{ y: groundY }}
          />
          <motion.div 
            className="absolute top-0 left-0 w-screen h-screen flex flex-col items-center justify-start mt-30"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: [0, 0.71, 0.2, 1.01], }}
            style={{ y: textY }}
          >
            <h2 className="xl:text-6xl sm:text-4xl md:text-4xl text-3xl font-bold text-white font-newamsterdam tracking-wider text-shadow-lg">
              No mountain too tall
            </h2>
            <h2 className="xl:text-5xl sm:text-4xl md:text-4xl text-3xl font-bold text-white font-newamsterdam tracking-wider text-shadow-lg">
                No obstacle too large
            </h2>
          </motion.div>
          {NAME.split('').map((letter, index) => (
            <div
              key={index}
              ref={el => lettersRef.current[index] = el}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black text-5xl font-regular text-shadow-lg"
            >
              {letter === ' ' ? '\u00A0' : letter}
            </div>
          ))}
        </div>
        <div className="w-screen absolute bottom-4 left-0 font-sans flex items-center justify-center gap-4">
          <h2 className="text-blue-500 text-lg font-bold text-shadow-lg py-1.5 px-4 border-1 border-neutral-500 rounded-full backdrop-blur-xs cursor-pointer hover:scale-110 transition-all duration-300">
            Linked<span className="text-white bg-blue-500 p-0.5 ml-0.5 rounded-sm">In</span>
          </h2>
          <h2 className="text-blue-500 text-lg font-bold text-shadow-lg py-1.5 px-4 border-1 border-neutral-500 rounded-full backdrop-blur-xs cursor-pointer hover:scale-110 transition-all duration-300">
            <img src="/images/github.svg" alt="Github" className="h-7" />
          </h2>
        </div>
    </section>
  )
}