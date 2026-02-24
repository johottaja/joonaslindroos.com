'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ModelViewer from '@/components/ModelViewer.jsx'
import TexturedText from '@/components/TexturedText.jsx'

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
        <section ref={sectionRef} className="w-full bg-neutral-950 relative pt-40 sm:h-auto h-screen">
            <div
                className="absolute top-0 left-0 w-full h-full -z-50"
                style={{
                    background: 'linear-gradient(180deg, #fff2 0%, #0000 30%)',
                    opacity: 0.7,
                    pointerEvents: 'none',
                    zIndex: 10,
                }}
            />
            <ModelViewer />
            <div className="absolute top-0 left-0 w-full h-full mt-30">
                <TexturedText 
                    innerRef={topHeadingRef}
                    style={{ transform: 'translateY(-50px)' }}
                    className="text-center tracking-widest text-5xl font-bold"
                >
                    Always pushing the boundaries
                </TexturedText>
            </div>
            <div className="absolute bottom-0 left-0 w-full flex justify-center items-center">
                <div className="tracking-widest text-center text-2xl font-bold px-5 py-10"
                style={{
                    background: 'radial-gradient(rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 70%)',
                }}
                >
                    <TexturedText 
                        innerRef={bottomHeadingRef}
                        style={{ transform: 'translateY(50px)' }}
                    >
                        With the power of
                    </TexturedText>
                    <TexturedText 
                        innerRef={technologyTextRef}
                        brightness={800}
                        className="text-7xl"
                        style={{ transform: 'scale(0.8)' }}
                    >
                        TECHNOLOGY
                    </TexturedText>
                </div>
            </div>
        </section>
    )
}