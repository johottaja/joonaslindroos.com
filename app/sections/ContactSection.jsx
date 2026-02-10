'use client'

import { useEffect } from 'react'

export default function ContactSection() {
  useEffect(() => {
    // Load reCAPTCHA script
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = src
        script.async = true
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })
    }

    const loadScripts = async () => {
      try {
        if (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
          await loadScript('https://www.google.com/recaptcha/api.js')
        }
      } catch (error) {
        console.error('Error loading scripts:', error)
      }
    }

    loadScripts()
  }, [])

  return (
    <main className="container mx-auto px-4">
      <section data-aos="zoom-out" className="relative py-4 xl:py-5">
        <div className="container mx-auto relative">
          <div className="flex justify-center">
            <div className="md:w-2/3 lg:w-1/2 xl:w-5/12 2xl:w-1/3">
              <div className="bg-gray-800 rounded-lg shadow-lg mb-5">
                <div className="p-6 sm:p-8">
                  <h2 className="text-center text-2xl font-bold mb-6">Contact me</h2>
                  <form method="post" action="/api/contact">
                    <div className="mb-4">
                      <input className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" type="text" id="name-2"
                             name="name" placeholder="Name" maxLength="30"
                             minLength="1" required />
                    </div>
                    <div className="mb-4">
                      <input className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" type="email"
                             id="email-2" name="email" placeholder="Email"
                             maxLength="150" minLength="1" required />
                    </div>
                    <div className="mb-4">
                      <textarea className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" id="message-2"
                                name="message" rows="6"
                                placeholder="Message" maxLength="300"
                                minLength="1" required></textarea>
                    </div>
                    <div>
                      {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && (
                        <div className="flex justify-center mb-4">
                          <div className="g-recaptcha" data-theme="dark"
                               data-sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}></div>
                        </div>
                      )}
                      <button className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200" type="submit">Send</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
