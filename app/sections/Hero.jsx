'use client'

import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { useWindowSize, useDebounce, useThrottle } from "@uidotdev/usehooks";
import { useEffect } from 'react'

export default function Hero() {
  const { scrollY } = useScroll()
  const { height: windowHeight, width: windowWidth } = useWindowSize()
  const debouncedHeight = useDebounce(windowHeight, 100)
  const debouncedWidth = useDebounce(windowWidth, 100)
  const throttledScrollY = useThrottle(scrollY, 100)
  
  const maxScroll = debouncedHeight ? debouncedHeight : 0
  const clampedScrollY = useTransform(scrollY, [0, maxScroll], [0, maxScroll], { clamp: true })
  
  const mouseX = useMotionValue(0)
  const springMouseX = useSpring(mouseX, { stiffness: 60, damping: 20, mass: 1 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (debouncedWidth) {
        mouseX.set(e.clientX / debouncedWidth)
      }
    }
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [debouncedWidth, mouseX])
  
  const mountainsY = useTransform(throttledScrollY, [0, debouncedHeight * 2], [0, -20])
  const parallax1Y = useTransform(throttledScrollY, [0, debouncedHeight * 2], [0, -40]) 
  const parallax2Y = useTransform(throttledScrollY, [0, debouncedHeight * 2], [0, -60])
  
  const headerTextY = useTransform(throttledScrollY, [0, debouncedHeight * 2], [0, -100])
  const coldTextY = useTransform(throttledScrollY, [0, debouncedHeight * 2], [0, -50])
  
  // Horizontal parallax transforms (different speeds for depth effect)
  const mountainsX = useTransform(springMouseX, [-1, 1], [-10, 10])
  const parallax1X = useTransform(springMouseX, [-1, 1], [-30, 30])
  const parallax2X = useTransform(springMouseX, [-1, 1], [-50, 50])
  const headerTextX = useTransform(springMouseX, [-1, 1], [-20, 20])
  const coldTextX = useTransform(springMouseX, [-1, 1], [-15, 15])

  const arrowOpacity = useTransform(
    scrollY,
    [0, (debouncedHeight || 1)],
    [1, 0]
  )

  return (
    <header className="h-[200lvh] relative -z-30 w-full">
      <div className="sticky top-0 w-full h-[110lvh] -z-50 overflow-hidden">
        <motion.img src="/images/sysiphus/far_mountains_sat.webp" alt="Sysiphus Far Mountains"
          className="absolute inset-0 w-full h-full object-cover object-center translate-y-[10px] -z-40 scale-110 backface-hidden"
          style={{ y: mountainsY, x: mountainsX, z: 0, willChange: 'transform, filter', WebkitTransform: 'translateZ(0)', WebkitBackfaceVisibility: 'hidden' }}
        />
        <motion.img src="/images/sysiphus/parallax_2_sat.webp" alt="Sysiphus Parallax 2"
          className="absolute inset-0 w-full h-full object-contain object-bottom-right -z-30 translate-x-1/5 md:translate-x-0 translate-y-[50px] scale-110 backface-hidden"
          style={{ y: parallax1Y, x: parallax1X, z: 0, willChange: 'transform, filter', WebkitTransform: 'translateZ(0)', WebkitBackfaceVisibility: 'hidden' }}
        />
        <motion.img src="/images/sysiphus/parallax_1_sat.webp" alt="Sysiphus Parallax 1"
          className="absolute inset-0 w-full h-full object-contain object-bottom-right -z-20 translate-x-1/5 md:translate-x-0 translate-y-[30px] scale-110 backface-hidden"
          style={{ y: parallax2Y, x: parallax2X, z: 0, willChange: 'transform, filter', WebkitTransform: 'translateZ(0)', WebkitBackfaceVisibility: 'hidden' }}
        />
        <img src="/images/sysiphus/sky_sat.webp" alt="Sysiphus Sky"
          className="absolute inset-0 w-full h-full object-cover -z-50 backface-hidden" />
        <div className="absolute w-full h-screen z-20 flex flex-col md:justify-between justify-center">
          <motion.div 
            className="w-full z-20 md:mx-10 mx-0 mt-10 flex flex-col justify-center md:justify-start items-center md:items-start"
            initial={{ opacity: 0, x: -200 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{ y: headerTextY, x: headerTextX, z: 0, willChange: 'transform, filter', WebkitTransform: 'translateZ(0)', WebkitBackfaceVisibility: 'hidden' }}
          >
            <h1 className="text-[50px] sm:text-[80px] md:text-[100px] xl:text-[150px] text-white font-newamsterdam tracking-wider text-shadow-lg">
              Joonas Lindroos
            </h1>
            <h2 className="xl:text-[60px] sm:text-[30px] md:text-[40px] text-[20px] font-bold text-black font-newamsterdam tracking-wider text-shadow-lg">
              Developer, student, builder
            </h2>
          </motion.div>
          <motion.div 
            className="z-20 md:pr-20 mx-0 flex flex-col justify-center md:justify-start items-center md:items-end"
            initial={{ opacity: 0, x: 200 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{ y: coldTextY, x: coldTextX, z: 0, willChange: 'transform', WebkitTransform: 'translateZ(0)', WebkitBackfaceVisibility: 'hidden' }}
          >
            <h2 className="xl:text-[60px] sm:text-[30px] md:text-[40px] text-[30px] mt-20 md:mt-0 md:border-0 border-t-2 border-white font-bold text-white font-newamsterdam tracking-wider text-shadow-lg text-center">
              Defined by resilience,<br /> driven by purpose.
            </h2>
          </motion.div>
          <motion.a
            href="#content"
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-0 text-white/90 hover:text-white transition-colors"
            aria-label="Scroll down"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ opacity: arrowOpacity }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </motion.a>
        </div>
      </div>
    </header>
  )
}
