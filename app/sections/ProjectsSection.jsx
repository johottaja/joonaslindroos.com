'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import Image from 'next/image'

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
    const bgFillRef = useRef(null)
    const progressRef = useRef(null)
    const progressWrapperRef = useRef(null)
    const mountainsTweenRef = useRef(null)
    const manTweenRef = useRef(null)

    // Duration constants in viewport-height units (used for section height and scroll animations)
    const HEADING_DURATION_VH = 1
    const APPEAR_DURATION_VH = 0.9
    const DISAPPEAR_DURATION_VH = 0.6
    const CARD_TOTAL_DURATION_VH = APPEAR_DURATION_VH + DISAPPEAR_DURATION_VH
    const CARD_OVERLAP_VH = 0.5
    const EXTRA_TAIL_SPACE_VH = 1

    const sectionHeightVh =
        HEADING_DURATION_VH +
        (projects.length - 1) * (CARD_TOTAL_DURATION_VH - CARD_OVERLAP_VH) +
        CARD_TOTAL_DURATION_VH +
        EXTRA_TAIL_SPACE_VH
    const sectionHeight = `calc(100lvh * ${sectionHeightVh})`
    const PROGRESS_BAR_MARGIN_VH = 1 // 60vh: fade in/out over first/last 60% of viewport

    useEffect(() => {
        const section = sectionRef.current
        const container = containerRef.current
        const heading = headingRef.current
        const cards = cardRefs.current
        const man = manRef.current
        const mountains = mountainsRef.current
        const bgFill = bgFillRef.current
        const progressBar = progressRef.current
        const progressWrapper = progressWrapperRef.current

        if (!section || !container || !heading || cards.length === 0) return

        const viewportHeight = document.documentElement.clientHeight
        const viewportWidth = document.documentElement.clientWidth

        const headingDuration = viewportHeight * HEADING_DURATION_VH
        const appearDuration = viewportHeight * APPEAR_DURATION_VH
        const disappearDuration = viewportHeight * DISAPPEAR_DURATION_VH
        const cardTotalDuration = viewportHeight * CARD_TOTAL_DURATION_VH
        const cardOverlap = viewportHeight * CARD_OVERLAP_VH

        // Heading fade-in timeline - takes full 100vh
        const headingTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: 'top top',
                end: `+=${headingDuration}`,
                scrub: true,
            }
        })

        // Phase 1: Fade in and move to middle, 10% right
        headingTimeline.fromTo(
            heading,
            { opacity: 0, y: 100, x: viewportWidth > 640 ? '20%' : '0%' },
            { opacity: 1, y: 100, x: viewportWidth > 640 ? '20%' : '0%', ease: 'power2.out', duration: 0.5 }
        )

        // Phase 2: Slide from 10% right to centered (x = 0)
        headingTimeline.to(heading, {
            x: 0,
            y: 0,
            ease: 'power2.inOut',
            duration: 0.5,
        })

        // Section scroll progress bar
        if (progressBar && progressWrapper) {
            gsap.set(progressBar, { scaleX: 0, transformOrigin: 'left center' })
            gsap.set(progressWrapper, { opacity: 0 })

            const startProgress = PROGRESS_BAR_MARGIN_VH / sectionHeightVh
            const endProgress = Math.max(startProgress, (sectionHeightVh - PROGRESS_BAR_MARGIN_VH) / sectionHeightVh)

            ScrollTrigger.create({
                trigger: section,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
                onUpdate: (self) => {
                    const p = self.progress
                    // Opacity: fade in over first 30vh, fade out over last 30vh
                    let opacity = 1
                    if (p <= startProgress) {
                        opacity = startProgress > 0 ? p / startProgress : 1
                    } else if (p >= endProgress) {
                        opacity = endProgress < 1 ? (1 - p) / (1 - endProgress) : 1
                    }
                    progressWrapper.style.opacity = String(opacity)
                    // Fill: 0–1 over the middle range only
                    const fill = p <= startProgress ? 0 : p >= endProgress ? 1 : (p - startProgress) / (endProgress - startProgress)
                    progressBar.style.transform = `scaleX(${fill})`
                },
            })
        }

        // Subtle looping shake for background layers - start paused, resume when visible
        if (mountains) {
            mountainsTweenRef.current = gsap.to(mountains, {
                x: '+=5',
                y: '+=3',
                duration: 3,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                paused: true,
            })
        }

        if (man) {
            manTweenRef.current = gsap.to(man, {
                x: '-=10',
                y: '+=10',
                duration: 2.5,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                paused: true,
            })
        }

        const bgObserver = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                mountainsTweenRef.current?.resume()
                manTweenRef.current?.resume()
                man?.classList.remove('invisible')
                mountains?.classList.remove('invisible')
                bgFill?.classList.remove('invisible')
            } else {
                mountainsTweenRef.current?.pause()
                manTweenRef.current?.pause()
                man?.classList.add('invisible')
                mountains?.classList.add('invisible')
                bgFill?.classList.add('invisible')
            }
        }, { threshold: 0 })

        if (section) bgObserver.observe(section)

        // Animation timeline for each card: appear from horizon, then move to corner and fade out
        cards.forEach((card, index) => {
            // Unique initial state per card (random X, from \"horizon\" below viewport)
            gsap.set(card, {
                z: -2000, 
                scale: 0.4, 
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
                    scrub: true,
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
            const rightOffset = (viewportWidth - cardWidth / 2) - ((viewportWidth > 640) ? (viewportWidth / 2) : 0)
            const bottomOffset = (viewportHeight - 100 - cardHeight / 2) - (viewportHeight / 2)

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

        // Cleanup
        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill())
            bgObserver.disconnect()
            mountainsTweenRef.current?.kill()
            manTweenRef.current?.kill()
        }
    }, [])

    return (
        <section ref={sectionRef} className="w-full relative" style={{ height: sectionHeight }}>
            <Image 
                ref={manRef}
                src="/images/sysiphus_projects/man_sat.png"
                alt=""
                width={100}
                height={200}
                sizes="100vw"
                className="!fixed lg:object-cover object-contain bg-center bottom-0 left-0 w-full lg:h-lvh -z-70 scale-110 pointer-events-none select-none invisible "
                style={{ willChange: 'transform', z: 0, WebkitTransform: 'translateZ(0)', WebkitBackfaceVisibility: 'hidden' }}
            />
            <Image 
                ref={mountainsRef}
                src="/images/sysiphus_projects/mountains_sat.png"
                alt=""
                fill
                sizes="100vw"
                className="!fixed object-cover -z-79 scale-120 pointer-events-none select-none invisible h-lvh"
                style={{ willChange: 'transform', z: 0, WebkitTransform: 'translateZ(0)', WebkitBackfaceVisibility: 'hidden' }}
            />
            <Image 
                ref={bgFillRef}
                src="/images/sysiphus_projects/sky_2_sat.webp"
                alt=""
                fill
                sizes="100vw"
                className="!fixed object-cover -z-80 pointer-events-none select-none invisible h-[100lvh]"
                style={{ z: 0, WebkitTransform: 'translateZ(0)', WebkitBackfaceVisibility: 'hidden' }}
            />

            {/* Scroll progress bar - outside transformed container so fixed centers in viewport */}
            <div
                ref={progressWrapperRef}
                className="fixed top-6 left-1/2 -translate-x-1/2 w-11/12 max-w-4xl h-1.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm -z-70"
            >
                <div
                    ref={progressRef}
                    className="h-full bg-white rounded-full origin-left"
                    style={{ transform: 'scaleX(0)' }}
                />
            </div>

            {/* Sticky container for cards */}
            <div 
                ref={containerRef}
                className="sticky top-0 left-0 w-full h-screen z-10 flex flex-col items-center justify-center overflow-hidden sm:translate-x-[-10%]"
                style={{ perspective: '1000px' }}
            >
                {/* Heading */}
                <h1 
                    ref={headingRef}
                    className="text-3xl md:text-6xl font-bold text-white mb-8 text-shadow-lg font-newamsterdam tracking-wider will-change-transform"
                >
                    Built along the way
                </h1>

                {/* Cards container with perspective */}
                <div 
                    className="relative w-full max-w-4xl h-64 md:h-80 pointer-events-none -z-72"
                    style={{ transformStyle: 'preserve-3d', willChange: 'transform', WebkitTransform: 'translateZ(0)', WebkitBackfaceVisibility: 'hidden' }}
                >
                    {projects.map((project, index) => {
                        const CardWrapper = project.external ? 'a' : Link
                        const cardProps = project.external 
                            ? { href: project.href, target: '_blank', rel: 'noopener noreferrer' }
                            : { href: project.href }

                        return (
                            <Link
                                key={project.id}
                                ref={el => cardRefs.current[index] = el}
                                prefetch={false}
                                {...cardProps}
                                className="absolute inset-0 mx-auto w-72 md:w-96 h-48 md:h-64 rounded-xl overflow-hidden shadow-2xl cursor-pointer group pointer-events-auto"
                                style={{ 
                                    transformStyle: 'preserve-3d',
                                    willChange: 'transform',
                                }}
                                href={project.href}
                                onClick={() => {
                                    if (project.external) {
                                        window.open(project.href, '_blank')
                                    }
                                }}
                            >
                                <Image 
                                    src={project.image}
                                    alt={project.title}
                                    fill
                                    sizes="(max-width: 768px) 288px, 384px"
                                    className="object-cover transition-transform duration-300 group-hover:scale-110"
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
                            </Link>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
