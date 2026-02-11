import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion'
import { useWindowSize, useDebounce } from "@uidotdev/usehooks";
import { useEffect } from 'react'

export default function Hero() {
  const { scrollY } = useScroll()
  const { height: windowHeight, width: windowWidth } = useWindowSize()
  const debouncedHeight = useDebounce(windowHeight, 100)
  const debouncedWidth = useDebounce(windowWidth, 100)
  
  const maxScroll = debouncedHeight ? debouncedHeight : 0
  const clampedScrollY = useTransform(scrollY, [0, maxScroll], [0, maxScroll], { clamp: true })
  
  // Add spring smoothing to scroll values
  const smoothScrollY = useSpring(clampedScrollY, { stiffness: 50, damping: 10, mass: 0.5 })
  
  // Mouse-based horizontal parallax
  const mouseX = useMotionValue(0)
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20, mass: 0.5 })
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (debouncedWidth) {
        // Normalize mouse position to -1 to 1 (center is 0)
        const normalizedX = e.clientX / debouncedWidth
        mouseX.set(normalizedX)
      }
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [debouncedWidth, mouseX])
  
  const mountainsY = useTransform(smoothScrollY, [0, debouncedHeight * 2], [0, -20])
  const parallax1Y = useTransform(smoothScrollY, [0, debouncedHeight * 2], [0, -40]) 
  const parallax2Y = useTransform(smoothScrollY, [0, debouncedHeight * 2], [0, -60])
  
  const headerTextY = useTransform(smoothScrollY, [0, debouncedHeight * 2], [0, -100])
  const coldTextY = useTransform(smoothScrollY, [0, debouncedHeight * 2], [0, -50])
  
  // Horizontal parallax transforms (different speeds for depth effect)
  const mountainsX = useTransform(smoothMouseX, [-1, 1], [-10, 10])
  const parallax1X = useTransform(smoothMouseX, [-1, 1], [-30, 30])
  const parallax2X = useTransform(smoothMouseX, [-1, 1], [-50, 50])
  const headerTextX = useTransform(smoothMouseX, [-1, 1], [-20, 20])
  const coldTextX = useTransform(smoothMouseX, [-1, 1], [-15, 15])

  return (
    <header className="h-[200lvh] relative -z-30 w-full">
      <div className="sticky top-0 w-full h-[110lvh] -z-50 saturate-60 overflow-hidden">
        <motion.img src="/images/sysiphus/sysiphus_far_mountains.webp" alt="Sysiphus Far Mountains" 
          className="absolute h-full w-full object-cover object-center -z-40 translate-y-[10px] scale-110"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: [0, 0.71, 0.2, 1.01], }}
          style={{ y: mountainsY, x: mountainsX }}
        />
        <motion.img src="/images/sysiphus/sysiphus_parallax_2.webp" alt="Sysiphus Parallax 2" 
          className="absolute w-full bottom-0 right-0 h-[100lvh] min-w-xl translate-x-1/5 md:translate-x-0 object-contain object-bottom-right -z-30 translate-y-[50px] scale-110"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.5, ease: [0, 0.71, 0.2, 1.01], }}
          style={{ y: parallax1Y, x: parallax1X }}
        />
        <motion.img src="/images/sysiphus/sysiphus_parallax_1.webp" alt="Sysiphus Parallax 1" 
          className="absolute bottom-0 right-0 -z-20 h-[100lvh] translate-x-1/5 md:translate-x-0 min-w-xl max-w-full object-contain object-bottom-right translate-y-[30px] scale-110"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.5, ease: [0, 0.71, 0.2, 1.01], }}
          style={{ y: parallax2Y, x: parallax2X }}
        />
        <img src="/images/sysiphus/Sysiphus_sky.webp" alt="Sysiphus Sky" 
          className="absolute object-cover w-full h-[100lvh] -z-50" />
        <div className="absolute w-full h-screen z-20 flex flex-col md:justify-between justify-center">
          <motion.div 
            className="w-full z-20 md:mx-10 mx-0 mt-10 flex flex-col justify-center md:justify-start items-center md:items-start"
            initial={{ opacity: 0, x: -200 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.5, ease: [0, 0.71, 0.2, 1.01], }}
            style={{ y: headerTextY, x: headerTextX }}
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
            transition={{ duration: 1.5, ease: [0, 0.71, 0.2, 1.01], }}
            style={{ y: coldTextY, x: coldTextX }}
          >
            <h2 className="xl:text-[60px] sm:text-[30px] md:text-[40px] text-[30px] mt-20 md:mt-0 md:border-0 border-t-2 border-white font-bold text-white font-newamsterdam tracking-wider text-shadow-lg text-center">
              Defined by resilience,<br /> driven by purpose.
            </h2>
          </motion.div>
        </div>
      </div>
    </header>
  )
}