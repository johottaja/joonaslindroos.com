'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ModelViewer from '@/components/ModelViewer.jsx'

gsap.registerPlugin(ScrollTrigger)

export default function TechSection() {
    const topHeadingRef = useRef(null)
    const bottomHeadingRef = useRef(null)
    const technologyTextRef = useRef(null)
    const sectionRef = useRef(null)

    useEffect(() => {
        const topHeading = topHeadingRef.current
        const bottomHeading = bottomHeadingRef.current
        const technologyText = technologyTextRef.current
        const section = sectionRef.current

        if (!topHeading || !bottomHeading || !technologyText || !section) return

        // Set initial states
        gsap.set([topHeading, bottomHeading, technologyText], { opacity: 0 })

        // Simple fade in from top for top heading
        gsap.to(topHeading, {
            scrollTrigger: {
                trigger: section,
                start: 'top 80%',
                toggleActions: 'play none none reverse',
            },
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power2.out'
        })

        // Simple fade in from bottom for bottom heading
        gsap.to(bottomHeading, {
            scrollTrigger: {
                trigger: section,
                start: 'top 70%',
                toggleActions: 'play none none reverse',
            },
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power2.out'
        })

        // Simple fade in and scale for TECHNOLOGY text
        gsap.to(technologyText, {
            scrollTrigger: {
                trigger: section,
                start: 'top 50%',
                toggleActions: 'play none none reverse',
            },
            opacity: 1,
            scale: 1,
            duration: 1.2,
            ease: 'power2.out',
            delay: 0.3
        })

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill())
        }
    }, [])

    return (
        <section ref={sectionRef} className="w-full bg-neutral-950 relative pt-40 pb-30">
            <ModelViewer />
            <div className="absolute top-0 left-0 w-full h-full absolute pt-30">
                <h2 
                    ref={topHeadingRef}
                    className="text-center tracking-widest text-5xl font-bold"
                    style={{
                        backgroundImage: 'url(/images/edited.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center bottom',
                        backgroundRepeat: 'no-repeat',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        filter: 'grayscale(100%) brightness(300%) contrast(70%)',
                        transform: 'translateY(-50px)'
                    }}
                >
                    Always pushing the boundaries
                </h2>
            </div>
            <div className="absolute bottom-0 left-0 w-full pb-30">
            <h2 
                    ref={bottomHeadingRef}
                    className="w-full text-center tracking-widest text-2xl font-bold"
                    style={{
                        backgroundImage: 'url(/images/edited.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center bottom',
                        backgroundRepeat: 'no-repeat',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        filter: 'grayscale(100%) brightness(300%) contrast(70%)',
                        transform: 'translateY(50px)'
                    }}
                >
                    With the power of <br/>
                    <p 
                        ref={technologyTextRef}
                        style={{
                            backgroundImage: 'url(/images/edited.png)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center bottom',
                            backgroundRepeat: 'no-repeat',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            filter: 'grayscale(100%) brightness(200%) contrast(70%)',
                            transform: 'scale(0.8)'
                        }}
                        className="text-7xl"
                    >
                        TECHNOLOGY
                    </p>
                </h2>
            </div>
        </section>
    )
}