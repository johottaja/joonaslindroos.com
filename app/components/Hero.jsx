import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { useWindowSize, useDebounce } from "@uidotdev/usehooks";

export default function Hero() {
  const { scrollY } = useScroll()
  const { height: windowHeight } = useWindowSize()
  const debouncedHeight = useDebounce(windowHeight, 100)
  
  // Add spring smoothing to scroll values
  const smoothScrollY = useSpring(scrollY, { stiffness: 100, damping: 10, mass: 0.5 })
  
  const mountainsY = useTransform(smoothScrollY, [0, debouncedHeight * 2], [0, -10])
  const parallax1Y = useTransform(smoothScrollY, [0, debouncedHeight * 2], [0, -30]) 
  const parallax2Y = useTransform(smoothScrollY, [0, debouncedHeight * 2], [0, -50])
  
  const headerTextY = useTransform(smoothScrollY, [0, debouncedHeight * 2], [0, -50])
  const coldTextY = useTransform(smoothScrollY, [0, debouncedHeight * 2], [0, -50])

  return (
    <header className="h-[200vh] relative -z-30 w-screen">
      <div className="sticky top-0 w-screen h-screen -z-50 saturate-60 overflow-hidden">
        <motion.img src="/images/sysiphus/sysiphus_far_mountains.webp" alt="Sysiphus Far Mountains" 
          className="absolute h-screen w-screen object-cover object-center -z-40 translate-y-[10px]"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0, 0.71, 0.2, 1.01], }}
          style={{ y: mountainsY }}
        />
        <motion.img src="/images/sysiphus/sysiphus_parallax_2.webp" alt="Sysiphus Parallax 2" 
          className="absolute w-screen top-0 right-0 h-screen min-w-xl translate-x-1/5 md:translate-x-0 object-contain object-bottom-right -z-30 translate-y-[50px]"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0, 0.71, 0.2, 1.01], }}
          style={{ y: parallax1Y }}
        />
        <motion.img src="/images/sysiphus/sysiphus_parallax_1.webp" alt="Sysiphus Parallax 1" 
          className="absolute bottom-0 right-0 -z-20 h-screen translate-x-1/5 md:translate-x-0 min-w-xl w-screen object-contain object-bottom-right translate-y-[30px]"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0, 0.71, 0.2, 1.01], }}
          style={{ y: parallax2Y }}
        />
        <img src="/images/sysiphus/Sysiphus_sky.webp" alt="Sysiphus Sky" 
          className="absolute object-cover w-screen h-screen -z-50" />
        <div className="absolute w-screen h-screen z-20">
          <motion.div 
            className="absolute top-0 left-0 w-screen h-screen z-20 md:ml-10 ml-0 mt-10 flex flex-col items-center md:items-start"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0, 0.71, 0.2, 1.01], }}
            style={{ y: headerTextY }}
          >
            <h1 className="text-[50px] sm:text-[80px] md:text-[100px] xl:text-[150px] text-white font-newamsterdam tracking-wider text-shadow-lg">
              Joonas Lindroos
            </h1>
            <h2 className="xl:text-[60px] sm:text-[30px] md:text-[40px] text-[20px] font-bold text-black font-newamsterdam tracking-wider text-shadow-lg">
              Developer, student, enthusiast
            </h2>
          </motion.div>
          <motion.div 
            className="absolute top-0 left-0 w-screen md:w-[98vw] h-screen z-20 flex flex-col items-center md:items-end justify-end"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0, 0.71, 0.2, 1.01], }}
            style={{ y: coldTextY }}
          >
            <h2 className="xl:text-[60px] sm:text-[30px] md:text-[40px] text-[30px] font-bold text-white font-newamsterdam tracking-wider text-shadow-lg pb-10">
              Defined by resilience,<br /> driven by purpose.
            </h2>
          </motion.div>
        </div>
      </div>
    </header>
  )
}