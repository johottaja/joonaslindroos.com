'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useWindowSize, useDebounce } from "@uidotdev/usehooks"
import { useRef } from 'react'

export default function FooterSection() {
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  })
  
  // Calculate parallax based on scroll progress through the section
  const mountains2Y = useTransform(scrollYProgress, [0, 1], [150, 0])
  const mountains1Y = useTransform(scrollYProgress, [0, 1], [200, 0])
  const groundY = useTransform(scrollYProgress, [0, 1], [450, 0])
  const textY = useTransform(scrollYProgress, [0, 1], [0, -100])

  return (
    <section ref={sectionRef} className="w-screen h-[300vh] relative">
        <div className="w-screen h-screen sticky top-0">
          <img 
            src="/images/sysiphus_footer/sky.png" 
            alt="Background" 
            className="w-full h-screen object-cover absolute top-0 left-0" 
          />
          <motion.img 
            src="/images/sysiphus_footer/mountains2.png" 
            alt="Background" 
            className="w-full h-screen object-cover absolute bottom-0 left-0"
            style={{ y: mountains2Y }}
          />
          <motion.img 
            src="/images/sysiphus_footer/mountains1.png" 
            alt="Background" 
            className="w-full h-screen object-cover absolute bottom-0 left-0"
            style={{ y: mountains1Y }}
          />
          <motion.img 
            src="/images/sysiphus_footer/ground.png" 
            alt="Background" 
            className="w-full h-screen object-cover absolute bottom-0 left-0"
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
        </div>
        <div className="w-screen absolute bottom-4 left-0 font-sans flex items-center justify-center gap-4">
          <h2 className="text-blue-500 text-lg font-bold text-shadow-lg py-1.5 px-4 border-1 border-white rounded-full backdrop-blur-xs cursor-pointer hover:scale-110 transition-all duration-300">
            Linked<span className="text-white bg-blue-500 p-0.5 ml-0.5 rounded-sm">In</span>
          </h2>
          <h2 className="text-blue-500 text-lg font-bold text-shadow-lg py-1.5 px-4 border-1 border-white rounded-full backdrop-blur-xs cursor-pointer hover:scale-110 transition-all duration-300">
            <img src="/images/github.svg" alt="Github" className="h-7" />
          </h2>
        </div>
    </section>
  )
}