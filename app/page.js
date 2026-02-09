'use client'

import Link from 'next/link'
import Image from 'next/image'
import Hero from '@/components/Hero.jsx'
import ModelViewer from '@/components/ModelViewer.jsx'
import GroundDivider from '@/components/GroundDivider.jsx'
import TechSection from '@/components/sections/TechSection.jsx'
import ProjectsSection from '@/components/sections/ProjectsSection.jsx'
import AgentSection from '@/components/sections/AgentSection.jsx'
import LetterAnimation from '@/components/LetterAnimation.jsx'
import FooterSection from '@/components/sections/FooterSection.jsx'
import ContactSection from '@/components/sections/ContactSection.jsx'

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
