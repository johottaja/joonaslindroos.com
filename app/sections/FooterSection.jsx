'use client'

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useWindowSize, useDebounce } from "@uidotdev/usehooks"
import { useRef, useEffect, useState } from 'react'
import Script from 'next/script'
import Image from 'next/image'
import gsap from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'

const MotionImage = motion.create(Image)

gsap.registerPlugin(MotionPathPlugin)

const NAME = "Joonas Lindroos"

export default function FooterSection() {
  const sectionRef = useRef(null)
  const lettersRef = useRef([])
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const [contactStatus, setContactStatus] = useState(null) // 'sending' | 'success' | 'error'
  const [contactError, setContactError] = useState('')
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
    const staggerDelay = 0.05

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
    const fourthPath = `M ${-farWidth} ${height * 0.8} Q ${-farWidth / 3} ${-veryHighPeak} ${farWidth / 2} ${height * 2}`

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
        duration: duration / 6,
        ease: "none",
        scale: 2
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
        duration: duration / 6,
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
        duration: duration / 3,
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
        duration: duration / 3,
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
        duration: duration / 4,
        ease: "none",
        scale: 4
      })
    })

    return () => {
      letters.forEach(letter => gsap.killTweensOf(letter))
    }
  }, [])

  return (
    <>
      {isContactModalOpen && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && (
        <Script src="https://www.google.com/recaptcha/api.js" strategy="lazyOnload" />
      )}
      <section ref={sectionRef} className="w-full h-[300vh] relative">
        <div className="w-full h-screen sticky top-0 overflow-hidden">
          <Image
            src="/images/sysiphus_footer/sky.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover -z-100"
          />
          <MotionImage
            src="/images/sysiphus_footer/mountains2.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover -z-80"
            style={{ y: mountains2Y, willChange: 'transform' }}
          />
          <MotionImage
            src="/images/sysiphus_footer/mountains1.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover -z-60"
            style={{ y: mountains1Y, willChange: 'transform' }}
          />
          <MotionImage
            src="/images/sysiphus_footer/ground2.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover -z-40"
            style={{ y: groundY, willChange: 'transform' }}
          />
          <motion.div 
            className="absolute top-0 left-0 w-full h-screen flex flex-col items-center justify-start mt-30"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: [0, 0.71, 0.2, 1.01], }}
            style={{ y: textY, willChange: 'transform' }}
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
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black text-5xl font-regular text-shadow-lg overflow-x-hidden"
            >
              {letter === ' ' ? '\u00A0' : letter}
            </div>
          ))}
        </div>
        <div className="w-full absolute bottom-4 left-0 font-sans flex items-center justify-center gap-4">
          <h2 className="text-blue-500 text-lg font-bold text-shadow-lg py-1.5 px-4 border-1 border-neutral-500 rounded-full backdrop-blur-xs cursor-pointer hover:scale-110 transition-all duration-300"
              href="https://www.linkedin.com/in/joonas-lindroos-917280230/">
            Linked<span className="text-white bg-blue-500 p-0.5 ml-0.5 rounded-sm">In</span>
          </h2>
          <h2 
            className="text-white font-newamsterdam tracking-widest text-lg text-shadow-lg py-1.5 px-4 border-1 border-neutral-500 rounded-full backdrop-blur-xs cursor-pointer hover:scale-110 transition-all duration-300"
            onClick={() => {
              setContactStatus(null)
              setContactError('')
              setIsContactModalOpen(true)
            }}
          >
            Contact Me
          </h2>
          <h2 className="text-blue-500 text-lg font-bold text-shadow-lg py-1.5 px-4 border-1 border-neutral-500 rounded-full backdrop-blur-xs cursor-pointer hover:scale-110 transition-all duration-300"
              href="https://github.com/johottaja">
            <img src="/images/github.svg" alt="Github" className="h-7" />
          </h2>
        </div>

        {/* Contact Modal */}
        <AnimatePresence>
          {isContactModalOpen && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Backdrop */}
              <motion.div
                className="absolute inset-0 bg-black/70 backdrop-blur-xs"
                onClick={() => setIsContactModalOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
              />
              
              {/* Modal Content */}
              <motion.div
                className="relative bg-transparent rounded-lg shadow-lg w-full max-w-md mx-4 backdrop-blur-sm border-2 border-white shadow-lg"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              >
                {/* Close Button */}
                <button
                  className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  onClick={() => setIsContactModalOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="p-6 sm:p-8 tracking-widest">
                  <h2 className="text-center text-2xl mb-6 text-white tracking-widest">Contact me</h2>
                  {contactStatus === 'success' ? (
                    <div className="text-center py-8">
                      <p className="text-green-400 text-lg mb-2">Message sent!</p>
                      <p className="text-gray-300 text-sm">Thanks for reaching out. I'll get back to you soon.</p>
                    </div>
                  ) : (
                  <form onSubmit={async (e) => {
                    e.preventDefault()
                    setContactStatus('sending')
                    setContactError('')

                    const recaptchaToken = typeof window !== 'undefined' && window.grecaptcha
                      ? window.grecaptcha.getResponse()
                      : null

                    try {
                      const res = await fetch('/api/contact', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          name: contactForm.name,
                          email: contactForm.email,
                          message: contactForm.message,
                          ...(recaptchaToken ? { 'g-recaptcha-response': recaptchaToken } : {}),
                        }),
                      })

                      const data = await res.json()

                      if (!res.ok) {
                        throw new Error(data.message || 'Failed to send message')
                      }

                      setContactStatus('success')
                      setContactForm({ name: '', email: '', message: '' })
                    } catch (err) {
                      setContactStatus('error')
                      setContactError(err.message || 'Something went wrong. Please try again.')
                      if (window.grecaptcha) window.grecaptcha.reset()
                    }
                  }}>
                    <div className="mb-4">
                      <input 
                        className="w-full px-3 py-2 bg-neutral-700/40 border border-neutral-300 rounded-md text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
                        type="text" 
                        id="footer-name"
                        name="name" 
                        placeholder="Name" 
                        maxLength="30"
                        minLength="1" 
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm(f => ({ ...f, name: e.target.value }))}
                        disabled={contactStatus === 'sending'}
                      />
                    </div>
                    <div className="mb-4">
                      <input 
                        className="w-full px-3 py-2 bg-neutral-700/40 border border-neutral-300 rounded-md text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
                        type="email"
                        id="footer-email" 
                        name="email" 
                        placeholder="Email"
                        maxLength="150" 
                        minLength="1" 
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm(f => ({ ...f, email: e.target.value }))}
                        disabled={contactStatus === 'sending'}
                      />
                    </div>
                    <div className="mb-4">
                      <textarea 
                        className="w-full px-3 py-2 bg-neutral-700/40 border border-neutral-300 rounded-md text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
                        id="footer-message"
                        name="message" 
                        rows="6"
                        placeholder="Message" 
                        maxLength="300"
                        minLength="1" 
                        required
                        value={contactForm.message}
                        onChange={(e) => setContactForm(f => ({ ...f, message: e.target.value }))}
                        disabled={contactStatus === 'sending'}
                      ></textarea>
                    </div>
                    <div>
                      {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && (
                        <div className="flex justify-center mb-4">
                          <div 
                            className="g-recaptcha" 
                            data-theme="dark"
                            data-sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                          ></div>
                        </div>
                      )}
                      {contactStatus === 'error' && (
                        <p className="text-red-400 text-sm mb-3 text-center">{contactError}</p>
                      )}
                      <button 
                        className="w-full bg-neutral-600 hover:bg-neutral-700 border-1 border-neutral-300 text-white font-medium py-2 px-4 cursor-pointer rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
                        type="submit"
                        disabled={contactStatus === 'sending'}
                      >
                        {contactStatus === 'sending' ? 'Sending...' : 'Send'}
                      </button>
                    </div>
                  </form>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </>
  )
}