'use client'

import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Send, Loader2 } from 'lucide-react'
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
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [responseId, setResponseId] = useState(null)
  
  const scrollContainerRef = useRef(null)
  const messageRefs = useRef([])
  const messageWrapperRef = useRef(null)

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return
    
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth'
    })
  }, [messages])

  // Update message scaling based on scroll position (throttled to avoid repaint storms when textarea is focused)
  const scaleRafRef = useRef(null)
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const updateScale = () => {
      const containerRect = container.getBoundingClientRect()
      const containerTop = containerRect.top
      const containerHeight = containerRect.height

      messageRefs.current.forEach((messageEl) => {
        if (!messageEl) return

        const messageRect = messageEl.getBoundingClientRect()

        // Calculate position relative to container (0 at top, 1 at bottom)
        let relativePosition = (messageRect.top - containerTop + 150) / containerHeight
        if (relativePosition > 1) relativePosition = 1

        // Scale from 0.3 at the top to 1.0 at the bottom
        const scale = Math.max(0.3, Math.min(1, 0.3 + relativePosition * 0.7))
        
        const role = messageEl.dataset.role
        const direction = role === 'user' ? -1 : 1
        const rotateY = (1 - relativePosition) * 20 * -direction
        const baseTranslateX = Math.min(Math.max(window.innerWidth * 0.25, 100), 250)
        const translateX = (1 - relativePosition) * baseTranslateX * -direction
        
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

    const scheduleUpdate = () => {
      if (scaleRafRef.current != null) return
      scaleRafRef.current = requestAnimationFrame(() => {
        scaleRafRef.current = null
        updateScale()
      })
    }

    updateScale()

    container.addEventListener('scroll', scheduleUpdate)
    window.addEventListener('resize', scheduleUpdate)

    return () => {
      container.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      if (scaleRafRef.current != null) cancelAnimationFrame(scaleRafRef.current)
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
          message: userMessage.content,
          ...(responseId ? { previousResponseId: responseId } : {}),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 429) {
          setMessages((current) => [
            ...current,
            {
              role: 'assistant',
              content:
                "You've used all your messages for now. If you're interested in Joonas' work or want to get in touch, feel free to reach out via the **Contact Me** button below or connect on [LinkedIn](https://www.linkedin.com/in/joonas-lindroos-917280230/)!",
            },
          ])
          return
        }
        throw new Error(data.error || 'Failed to reach the agent.')
      }

      if (data.responseId) {
        setResponseId(data.responseId)
      }
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
      <div className="max-w-5xl mx-auto rounded-lg shadow-lg p-3 sm:p-4 flex md:flex-row flex-col-reverse will-change-transform translate-z-0">
        <div className="flex flex-col-reverse md:flex-col md:w-1/2 w-full justify-center p-4 relative mr-10">
        
        <h2 className="text-2xl font-bold my-8 text-center pointer-events-none select-none will-change-transform">Ask My AI agent about my projects</h2>

        <form onSubmit={handleSubmit} className="space-y-2 flex flex-col">
          <label htmlFor="agent-input" className="sr-only">
            Ask a question
          </label>
          <div
            className="w-full flex items-start gap-2 px-3 py-2 bg-neutral-900 border border-gray-800 rounded-xl  shadow-[0_0_10px_2px_rgba(255,255,255,0.1)]"
          >
            <textarea
              id="agent-input"
              rows={3}
              className="flex-1 z-30 bg-transparent border-none overscroll-y-contain outline-none resize-none text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-0"
              placeholder='Try saying "Tell me about his projects" or ask about a specific project...'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="flex-shrink-0 z-40 inline-flex items-center justify-center rounded-full p-2 
              disabled:bg-gray-600 disabled:cursor-not-allowed text-white transition-all duration-500 cursor-pointer
              hover:bg-neutral-800"
            >
              <Send className={`h-4 w-4 ${isLoading ? 'opacity-60 animate-pulse' : ''}`} />
            </button>
          </div>
          {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </form>
        </div>
        <div ref={messageWrapperRef} className="relative md:w-1/2 w-full h-64 border-b border-white will-change-transform" 
        style={{ perspective: '1000px', 
          background: 'linear-gradient(0deg, #333, #0a0a0a0 100%)',
         }}>
        <div 
          ref={scrollContainerRef}
          className="absolute top-0 left-0 h-128 w-[200%]
          overflow-y-auto space-y-3 text-sm
          -translate-x-1/4 -translate-y-1/2 -z-20 overflow-x-hidden"
          style={{ transformStyle: 'preserve-3d', willChange: 'transform', WebkitTransform: 'translateZ(0)', WebkitBackfaceVisibility: 'hidden' }}
        >
          <div className="h-80"></div>
          {messages.flatMap((message, msgIdx) => {
            // Split assistant messages by double newlines for rendering
            const parts = message.role === 'assistant' 
              ? message.content.split('\n\n').filter(part => part.trim())
              : [message.content]
            
            return parts.map((part, partIdx) => {
              const uniqueIdx = msgIdx * 1000 + partIdx
              return (
                <div 
                  key={uniqueIdx} 
                  ref={(el) => (messageRefs.current[uniqueIdx] = el)}
                  data-role={message.role}
                  className="w-1/2 mx-auto -z-20"
                  style={{ transformStyle: 'preserve-3d', willChange: 'transform', WebkitTransform: 'translateZ(0)', WebkitBackfaceVisibility: 'hidden' }}
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
                        <ReactMarkdown className="prose prose-sm prose-invert break-words">
                          {part}
                        </ReactMarkdown>
                      ) : (
                        <p className="whitespace-pre-wrap break-words">{part}</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          })}
          {isLoading && (
            <div className="flex justify-start">
              <div className="w-1/2 mx-auto rounded-md px-3 py-2 text-gray-300 text-xs italic flex flex-col items-start justify-center gap-2">
                <div className="bg-neutral-700 text-white rounded-md px-3 py-2 flex items-center justify-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Thinking...
                </div>
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

