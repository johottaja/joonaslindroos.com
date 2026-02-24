'use client'

const linkClass = "text-blue-500 text-lg font-bold text-shadow-lg py-1.5 px-4 border-1 border-neutral-500 rounded-full backdrop-blur-xs cursor-pointer hover:scale-110 transition-all duration-300 inline-flex items-center"

const LINKEDIN_URL = "https://www.linkedin.com/in/joonas-lindroos-917280230/"

export default function LinkedInButton() {
  return (
    <a
      href={LINKEDIN_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={linkClass}
    >
      Linked<span className="text-white bg-blue-500 p-0.5 ml-0.5 rounded-sm">In</span>
    </a>
  )
}
