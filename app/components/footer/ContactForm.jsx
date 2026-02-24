'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import Script from 'next/script'

const inputClass = "w-full px-3 py-2 bg-neutral-700/40 border border-neutral-300 rounded-md text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"

export default function ContactForm({ isOpen, onClose }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState(null)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('sending')
    setError('')

    const recaptchaToken = typeof window !== 'undefined' && window.grecaptcha
      ? window.grecaptcha.getResponse()
      : null

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message,
          ...(recaptchaToken ? { 'g-recaptcha-response': recaptchaToken } : {}),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Failed to send message')
      }

      setStatus('success')
      setForm({ name: '', email: '', message: '' })
    } catch (err) {
      setStatus('error')
      setError(err.message || 'Something went wrong. Please try again.')
      if (typeof window !== 'undefined' && window.grecaptcha) window.grecaptcha.reset()
    }
  }

  return (
    <>
      {isOpen && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && (
        <Script src="https://www.google.com/recaptcha/api.js" strategy="lazyOnload" />
      )}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/70 backdrop-blur-xs"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              className="relative bg-transparent rounded-lg shadow-lg w-full max-w-md mx-4 backdrop-blur-sm border-2 border-white"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors cursor-pointer"
                onClick={onClose}
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="p-6 sm:p-8 tracking-widest">
                <h2 className="text-center text-2xl mb-6 text-white tracking-widest">Contact me</h2>
                {status === 'success' ? (
                  <div className="text-center py-8">
                    <p className="text-green-400 text-lg mb-2">Message sent!</p>
                    <p className="text-gray-300 text-sm">Thanks for reaching out. I'll get back to you soon.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <input
                        className={inputClass}
                        type="text"
                        id="footer-name"
                        name="name"
                        placeholder="Name"
                        maxLength={30}
                        minLength={1}
                        required
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        disabled={status === 'sending'}
                      />
                    </div>
                    <div className="mb-4">
                      <input
                        className={inputClass}
                        type="email"
                        id="footer-email"
                        name="email"
                        placeholder="Email"
                        maxLength={150}
                        minLength={1}
                        required
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        disabled={status === 'sending'}
                      />
                    </div>
                    <div className="mb-4">
                      <textarea
                        className={inputClass}
                        id="footer-message"
                        name="message"
                        rows={6}
                        placeholder="Message"
                        maxLength={300}
                        minLength={1}
                        required
                        value={form.message}
                        onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                        disabled={status === 'sending'}
                      />
                    </div>
                    <div>
                      {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && (
                        <div className="flex justify-center mb-4">
                          <div
                            className="g-recaptcha"
                            data-theme="dark"
                            data-sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                          />
                        </div>
                      )}
                      {status === 'error' && (
                        <p className="text-red-400 text-sm mb-3 text-center">{error}</p>
                      )}
                      <button
                        className="w-full bg-neutral-600 hover:bg-neutral-700 border-1 border-neutral-300 text-white font-medium py-2 px-4 cursor-pointer rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        type="submit"
                        disabled={status === 'sending'}
                      >
                        {status === 'sending' ? 'Sending...' : 'Send'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
