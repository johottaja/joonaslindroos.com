import dynamic from 'next/dynamic'
import Hero from '@/sections/Hero.jsx'
import GroundDivider from '@/components/GroundDivider.jsx'

const TechSection = dynamic(() => import('@/sections/TechSection.jsx'))
const LetterMorphSection = dynamic(() => import('@/sections/LetterMorphSection.jsx'))
const ProjectsSection = dynamic(() => import('@/sections/ProjectsSection.jsx'))
const AgentSection = dynamic(() => import('@/sections/AgentSection.jsx'))
const FooterSection = dynamic(() => import('@/sections/FooterSection.jsx'))

export default function Home() {
  return (
    <>
      <Hero />
      <GroundDivider /> 
      <TechSection />
      <LetterMorphSection />
      <GroundDivider />
      <ProjectsSection />
      <GroundDivider />
      <AgentSection />
      <GroundDivider />
      <FooterSection />
    </>
  )
}
