'use client'

import Link from 'next/link'
import Image from 'next/image'
import Hero from '@/components/Hero.jsx'
import ModelViewer from '@/components/ModelViewer.jsx'
import GroundDivider from '@/components/GroundDivider.jsx'
import TechSection from '@/sections/TechSection.jsx'
import ProjectsSection from '@/sections/ProjectsSection.jsx'
import AgentSection from '@/sections/AgentSection.jsx'
import LetterAnimation from '@/components/LetterAnimation.jsx'
import FooterSection from '@/sections/FooterSection.jsx'
import ContactSection from '@/sections/ContactSection.jsx'

export default function Home() {
  return (
    <>
      <Hero />
      <GroundDivider />
      <TechSection />
      <LetterAnimation />
      <GroundDivider />
      <ProjectsSection />
      <GroundDivider />
      <AgentSection />
      <GroundDivider />
      <FooterSection />
    </>
  )
}
