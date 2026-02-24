'use client'

const linkClass = "text-blue-500 text-lg font-bold text-shadow-lg py-1.5 px-4 border-1 border-neutral-500 rounded-full backdrop-blur-xs cursor-pointer hover:scale-110 transition-all duration-300 inline-flex items-center"

const GITHUB_URL = "https://github.com/johottaja"

export default function GithubButton() {
  return (
    <a
      href={GITHUB_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={linkClass}
    >
      <img src="/images/github.svg" alt="GitHub" className="h-7" />
    </a>
  )
}
