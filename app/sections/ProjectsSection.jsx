'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'

gsap.registerPlugin(ScrollTrigger)

const projects = [
    {
        id: 1,
        title: 'Python Neural Networks',
        image: '/images/neuralnetworks.webp',
        href: 'https://github.com/johottaja/py-neural-networks',
        external: true,
        description: 'Developed a neural network from first principles using Python and NumPy, demonstrating a comprehensive understanding of perceptrons and backpropagation.',
        date: '2024-12-01',
        cornerText: 'Click for github'
    },
    { 
        id: 2, 
        title: 'AI Video Generator', 
        image: '/images/pfp.png', 
        href: 'https://github.com/johottaja/AI-videos', 
        external: true,
        description: 'A video generator that uses AI to generate images and stiches them together, integrating human-in-the-loop for QA',
        date: '2023-11-01',
        cornerText: 'Click for github'
    },
    { 
        id: 3, 
        title: 'Fax or Cap', 
        image: '/images/Faxorcap.png', 
        href: 'https://test.joonaslindroos.com', 
        external: true,
        description: 'A rudamentary platform for posting and voting on other users statements truthfulness',
        date: '2022-06-01',
        cornerText: 'Click for live demo'
    },
    { 
        id: 4, 
        title: 'Two Player Snake', 
        image: '/images/PvPSnakeGame.png', 
        href: '/snake/pvp', 
        external: false,
        description: 'Competitive two-player browser snake with real-time PvP gameplay over the internet.',
        date: '2021-03-15',
        cornerText: 'Click for live demo'
    },
    { 
        id: 5, 
        title: 'One Player Snake', 
        image: '/images/SnakeGame.png', 
        href: '/snake/comp', 
        external: false,
        description: 'A modern take on the classic single-player snake arcade game with a global leaderboard',
        date: '2020-08-10',
        cornerText: 'Click for live demo'
    },
    { 
        id: 6, 
        title: 'Text Animation', 
        image: '/images/TextAnimation.png', 
        href: '/textspread', 
        external: false,
        description: 'Interactive text animation playground with particle-based visual effects and text rendering',
        date: '2019-11-20',
        cornerText: 'Click for live demo'
    },
]

function formatRelativeTime(dateString) {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date

    const seconds = Math.floor(diffMs / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const years = Math.floor(days / 365)
    const months = Math.floor((days % 365) / 30)

    if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`
    if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    return 'Just now'
}

export default function ProjectsSection() {
    const sectionRef = useRef(null)
    const containerRef = useRef(null)
    const headingRef = useRef(null)
    const cardRefs = useRef([])
    const manRef = useRef(null)
    const mountainsRef = useRef(null)
    const [sectionHeight, setSectionHeight] = useState('100vh')

    useEffect(() => {
        const section = sectionRef.current
        const container = containerRef.current
        const heading = headingRef.current
        const cards = cardRefs.current
        const man = manRef.current
        const mountains = mountainsRef.current

        if (!section || !container || !heading || cards.length === 0) return

        const viewportHeight = window.innerHeight
        const viewportWidth = window.innerWidth

        // Heading fade-in timeline - takes full 100vh
        const headingTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: 'top top',
                end: `+=${viewportHeight}`, // 100vh
                scrub: 1,
            }
        })

        // Phase 1: Fade in and move to middle, 10% right
        headingTimeline.fromTo(
            heading,
            { opacity: 0, y: 100, x: '20%' },
            { opacity: 1, y: 100, x: '20%', ease: 'power2.out', duration: 0.5 }
        )

        // Phase 2: Slide from 10% right to centered (x = 0)
        headingTimeline.to(heading, {
            x: 0,
            y: 0,
            ease: 'power2.inOut',
            duration: 0.5,
        })

        // Subtle looping shake for background layers
        if (mountains) {
            gsap.to(mountains, {
                x: '+=5',
                y: '+=3',
                rotationZ: 0.3,
                duration: 3,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            })
        }

        if (man) {
            gsap.to(man, {
                x: '-=10',
                y: '+=10',
                rotationZ: -0.4,
                duration: 2.5,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            })
        }

        // Animation timeline for each card:
        // Phase 1: Appear from horizon (80vh)
        // Phase 2: Move to bottom right corner and fade out (60vh)
        // Each card gets 140vh total, with 20vh overlap between cards
        const headingDuration = viewportHeight // 100vh
        const appearDuration = viewportHeight * 0.9 // 80vh
        const disappearDuration = viewportHeight * 0.6 // 60vh
        const cardTotalDuration = appearDuration + disappearDuration // 140vh
        const cardOverlap = viewportHeight * 0.2 // 20vh overlap

        cards.forEach((card, index) => {
            // Unique initial state per card (random X, from \"horizon\" below viewport)
            gsap.set(card, { 
                scale: 0.4, 
                z: -2000, 
                opacity: 0,
                rotateX: 20,
                rotateY: 45,
                x: (Math.random() - 1) * viewportWidth,
                y: viewportHeight * 1.5
            })

            const cardStartOffset = headingDuration + (index * (cardTotalDuration - cardOverlap))
            const disappearEndOffset = cardStartOffset + cardTotalDuration

            // Card-specific scroll-controlled timeline (both phases)
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: section,
                    start: `top+=${cardStartOffset}px top`,
                    end: `top+=${disappearEndOffset}px top`,
                    scrub: 1,
                }
            })

            // Phase 1: Appear from horizon into center
            tl.to(card, {
                scale: 1,
                z: 0,
                opacity: 1,
                rotateX: 0,
                rotateY: 0,
                x: 0,
                y: 0,
                ease: 'power2.out',
                duration: appearDuration / cardTotalDuration, // normalized within timeline
            })

            // Phase 2: Move to bottom right corner and fade out
            const cardWidth = 384 // md:w-96 = 384px
            const cardHeight = 256 // md:h-64 = 256px
            // Card center target so right/bottom edges are ~100px from screen edges
            const rightOffset = (window.innerWidth - 100 - cardWidth / 2) - (window.innerWidth / 2)
            const bottomOffset = (window.innerHeight - 100 - cardHeight / 2) - (window.innerHeight / 2)

            tl.to(card, {
                x: rightOffset,
                y: bottomOffset,
                scale: 0.3,
                opacity: 0,
                rotateZ: 15,
                ease: 'power2.in',
                duration: disappearDuration / cardTotalDuration,
            })
        })

        // Calculate total section height dynamically
        const lastCardEnd = headingDuration + ((cards.length - 1) * (cardTotalDuration - cardOverlap)) + cardTotalDuration
        // Add extra space at the end so the last card's exit animation can fully play
        const extraTailSpace = viewportHeight*1.5 // one more viewport height as a spacer
        setSectionHeight(`${lastCardEnd + extraTailSpace}px`)

        // Cleanup
        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill())
        }
    }, [])

    return (
        <section ref={sectionRef} className="w-full relative" style={{ height: sectionHeight }}>
            <img 
                ref={manRef}
                src="/images/sysiphus_projects/man.png" 
                className="fixed inset-0 w-full h-screen object-cover -z-70 saturate-60 scale-110 pointer-events-none"
            />
            <img 
                ref={mountainsRef}
                src="/images/sysiphus_projects/mountains.png" 
                className="fixed inset-0 w-full h-screen object-cover -z-79 saturate-60 scale-110 translate-x-[5%]" 
            />
            <img 
                src="/images/sysiphus_projects/background_filled.png" 
                className="fixed inset-0 w-full h-screen object-cover -z-80 saturate-60" 
            />
            
            {/* Sticky container for cards */}
            <div 
                ref={containerRef}
                className="sticky top-0 left-0 w-full h-screen z-10 flex flex-col items-center justify-center overflow-hidden"
                style={{ perspective: '1000px', transform: `translateX(-10%)` }}
            >
                {/* Heading */}
                <h1 
                    ref={headingRef}
                    className="text-3xl md:text-6xl font-bold text-white mb-8 text-shadow-lg font-newamsterdam tracking-wider"
                >
                    Built along the way
                </h1>

                {/* Cards container with perspective */}
                <div 
                    className="relative w-full max-w-4xl h-64 md:h-80"
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {projects.map((project, index) => {
                        const CardWrapper = project.external ? 'a' : Link
                        const cardProps = project.external 
                            ? { href: project.href, target: '_blank', rel: 'noopener noreferrer' }
                            : { href: project.href }

                        return (
                            <CardWrapper
                                key={project.id}
                                ref={el => cardRefs.current[index] = el}
                                {...cardProps}
                                className="absolute inset-0 mx-auto w-72 md:w-96 h-48 md:h-64 rounded-xl overflow-hidden shadow-2xl cursor-pointer group"
                                style={{ 
                                    transformStyle: 'preserve-3d',
                                }}
                                href={project.href}
                                onClick={() => {
                                    if (project.external) {
                                        window.open(project.href, '_blank')
                                    }
                                }}
                            >
                                <img 
                                    src={project.image}
                                    alt={project.title}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                {project.date && (
                                    <div className="absolute top-2 left-2 bg-black/70 text-xs md:text-sm text-white px-2 py-1 rounded">
                                        {formatRelativeTime(project.date)}
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 text-xs bg-black/70 text-white px-2 py-1 rounded">{project.cornerText}</div>
                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                    <h3 className="text-xl md:text-2xl font-bold text-white font-newamsterdam tracking-wide text-shadow-lg">
                                        {project.title}
                                    </h3>
                                    {project.description && (
                                        <p className="mt-1 text-sm md:text-base text-gray-200 text-shadow-lg">
                                            {project.description}
                                        </p>
                                    )}
                                </div>
                            </CardWrapper>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
