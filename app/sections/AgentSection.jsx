'use client'

import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Send } from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function AgentSection() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hi! I'm an AI agent that knows about Joonas' GitHub projects. Ask me anything about his work or specific repos.",
    },
    {
      role: 'user',
      content: "What programming languages does Joonas use most on GitHub?",
    },
    {
      role: 'assistant',
      content: "Joonas primarily uses JavaScript, TypeScript, and Python in his public repositories.",
    },
    {
      role: 'user',
      content: "Can you list some of Joonas' most popular repositories?",
    },
    {
      role: 'assistant',
      content: "Certainly! Some popular repos include 'cool-app', 'openai-integration', and 'portfolio-site'.",
    },
    {
      role: 'user',
      content: "Does he have any projects related to machine learning?",
    },
    {
      role: 'assistant',
      content: "Yes, Joonas has a project called 'ml-experiments' where he explores different machine learning algorithms.",
    },
    {
      role: 'user',
      content: "How often does Joonas contribute to his repos?",
    },
    {
      role: 'assistant',
      content: "Joonas is quite active and typically pushes updates several times a month.",
    },
    {
      role: 'user',
      content: "Is there a way to contact Joonas from his repos?",
    },
    {
      role: 'assistant',
      content: "Most repositories include a README with his contact info or links to social profiles.",
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const scrollContainerRef = useRef(null)
  const messageRefs = useRef([])
  const messageWrapperRef = useRef(null)

  // Update message scaling based on scroll position
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const updateScale = () => {
      const containerRect = container.getBoundingClientRect()
      const containerTop = containerRect.top
      const containerBottom = containerRect.bottom
      const containerHeight = containerRect.height

      messageRefs.current.forEach((messageEl, idx) => {
        if (!messageEl) return

        const messageRect = messageEl.getBoundingClientRect()

        // Calculate position relative to container (0 at top, 1 at bottom)
        let relativePosition = (messageRect.top - containerTop + 150) / containerHeight
        if (relativePosition > 1) relativePosition = 1

        // Scale from 0.3 at the top to 1.0 at the bottom
        const scale = Math.max(0.3, Math.min(1, 0.3 + relativePosition * 0.7))
        
        // Alternate rotation direction based on index
        // Even index: rotate right (positive), Odd index: rotate left (negative)
        const direction = idx % 2 === 0 ? 1 : -1
        const rotateY = (1 - relativePosition) * 20 * -direction
        const translateX = (1 - relativePosition) * 350 * -direction
        
        gsap.to(messageEl, {
          scale: scale,
          opacity: scale,
          rotateZ: rotateY,
          translateX: translateX,
          transformOrigin: 'center center',
          duration: 0.2,
          ease: 'expoScale(0.5, 7, none)'
        })
      })
    }

    // Initial update
    updateScale()

    // Update on scroll
    container.addEventListener('scroll', updateScale)
    
    // Update on window resize
    window.addEventListener('resize', updateScale)

    return () => {
      container.removeEventListener('scroll', updateScale)
      window.removeEventListener('resize', updateScale)
    }
  }, [messages])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = { role: 'user', content: input.trim() }
    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input.trim(),
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to reach the agent. Please try again.')
      }

      const data = await res.json()
      const assistantMessage = {
        role: 'assistant',
        content: data.reply ?? 'Sorry, I could not generate a response.',
      }
      setMessages((current) => [...current, assistantMessage])
    } catch (err) {
      console.error('Agent error:', err)
      setError('Something went wrong talking to the agent. Please try again.')
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: "I ran into an error while answering that. Please try asking again in a moment.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="py-50 bg-neutral-950 w-full tracking-wide font-sans min-h-screen overflow-hidden relative">
      <div className="max-w-5xl mx-auto rounded-lg shadow-lg p-3 sm:p-4 flex flex-row">
        <div className="flex flex-col w-1/2 justify-center p-4 relative mr-10">
        
        <h2 className="text-2xl font-bold mb-8 text-center">Ask My AI agent about my projects</h2>

        <form onSubmit={handleSubmit} className="space-y-2 flex flex-col">
          <label htmlFor="agent-input" className="sr-only">
            Ask a question
          </label>
          <div
            className="w-full flex items-start gap-2 px-3 py-2 bg-neutral-900 border border-gray-800 rounded-xl focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent shadow-[0_0_10px_2px_rgba(255,255,255,0.1)]"
          >
            <textarea
              id="agent-input"
              rows={3}
              className="flex-1 z-30 bg-transparent border-none overscroll-y-contain outline-none resize-none text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-0"
              placeholder="Ask about my public projects and their contents..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="flex-shrink-0 z-30 inline-flex items-center justify-center rounded-full p-2 
              disabled:bg-gray-600 disabled:cursor-not-allowed text-white transition-all duration-500 cursor-pointer
              hover:bg-neutral-800"
            >
              <Send className={`h-4 w-4 ${isLoading ? 'opacity-60 animate-pulse' : ''}`} />
            </button>
          </div>
          {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </form>
        </div>
        <div ref={messageWrapperRef} className="relative w-1/2 h-64 border-b border-white" 
        style={{ perspective: '1000px', 
          background: 'linear-gradient(0deg, #333, #0a0a0a0 100%)',
         }}>
        <div 
          ref={scrollContainerRef}
          className="absolute top-0 left-0 h-128 w-[200%]
          overflow-y-auto space-y-3 text-sm
          -translate-x-1/4 -translate-y-1/2 -z-20 overflow-x-hidden"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="h-80"></div>
          {messages.map((message, idx) => (
            <div 
              key={idx} 
              ref={(el) => (messageRefs.current[idx] = el)}
              className="w-1/2 mx-auto -z-20"
              style={{ transformStyle: 'preserve-3d' }}
            >
            <div
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-md px-3 py-2 shadow-xl ${
                  message.role === 'user'
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-700 text-gray-100'
                }`}
              >
                {message.role === 'assistant' ? (
                  <ReactMarkdown className="whitespace-pre-wrap break-words">
                    {message.content}
                  </ReactMarkdown>
                ) : (
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                )}
              </div>
            </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-md px-3 py-2 bg-gray-700 text-gray-300 text-xs italic">
                Thinking...
              </div>
            </div>
            
          )}
          <div className="h-1"></div>
        </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-full pointer-events-none"
      style={{ background: 'linear-gradient(0deg, #fff2 0%, #0000 20%, #0000 80%, #fff2 100%)' }}>

      </div>
    </section>
  )
}

