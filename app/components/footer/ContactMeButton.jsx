'use client'

const buttonClass = "text-white font-newamsterdam tracking-widest text-lg text-shadow-lg py-1.5 px-4 border-1 border-neutral-500 rounded-full backdrop-blur-xs cursor-pointer hover:scale-110 transition-all duration-300 text-nowrap"

export default function ContactMeButton({ onClick }) {
  return (
    <button
      type="button"
      className={buttonClass}
      onClick={onClick}
    >
      Contact Me
    </button>
  )
}
