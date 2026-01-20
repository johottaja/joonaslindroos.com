'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Hero from '@/components/Hero.jsx'
import ModelViewer from '@/components/ModelViewer.jsx'

export default function Home() {
  useEffect(() => {
    // Load external scripts
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
    <>
      <Hero />

      <section className="w-full bg-black">
          <h2 className="text-center tracking-widest text-5xl font-bold pt-36 pb-10">Always pushing the boundaries</h2>
          <ModelViewer />
      </section>

      <main className="container mx-auto px-4">
        <section id="projects">
          <div className="container mx-auto py-4 xl:py-5">
            <div className="mb-5" data-aos="zoom-in" data-aos-duration="200" data-aos-delay="200">
              <div className="md:w-2/3 xl:w-1/2 text-center mx-auto">
                <h2 className="text-4xl font-bold mb-4">Projects</h2>
                <p className="lg:w-1/2 mx-auto">A curated selection of my web-based, passion-driven projects</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="w-full" data-aos="fade-right" data-aos-duration="500" data-aos-delay="100">
                <div className="flex flex-col lg:flex-row">
                  <div className="w-full">
                    <a href="https://test.joonaslindroos.com">
                      <img className="rounded block w-full fit-cover" style={{ height: '200px' }} 
                           src="/images/Faxorcap.png" alt="Fax or Cap image" />
                    </a>
                  </div>
                  <div className="py-4 lg:py-0 lg:px-4">
                    <h4 className="text-xl font-semibold mb-2"><a className="text-white hover:text-gray-300" href="https://test.joonaslindroos.com">Fax or Cap</a></h4>
                    <p className="desc-text mb-4">A straightforward web application enabling users to create posts, which others can then vote on as either true or false. The user interface is minimal, as the primary objective of the project was to gain hands-on experience with databases and SQL.</p>
                    <div className="flex flex-wrap gap-2 w-full" role="group">
                      <button className="tech tech-node" type="button">Node.js</button>
                      <button className="tech tech-mysql" type="button">MySQL</button>
                      <button className="tech tech-ejs" type="button">EJS</button>
                      <button className="tech tech-express" type="button">Express</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full pt-3 lg:pt-5" data-aos="fade-left" data-aos-duration="500" data-aos-delay="100">
                <div className="flex flex-col lg:flex-row">
                  <div className="order-last lg:order-first py-4 lg:py-0 lg:px-4">
                    <h4 className="text-xl font-semibold mb-2"><Link href="/snake/pvp" className="text-white hover:text-gray-300">Two Player Snake</Link></h4>
                    <p className="desc-text mb-4">An enhanced version of the classic Snake game designed for two players, where the goal is to outmaneuver and cause the opponent to crash. The game supports both local multiplayer on the same device and online multiplayer through WebSocket communication.</p>
                    <div className="flex flex-wrap gap-2 w-full" role="group">
                      <button className="tech tech-node" type="button">Node.js</button>
                      <button className="tech tech-websockets" type="button">Websockets</button>
                      <button className="tech tech-express" type="button">Express</button>
                    </div>
                  </div>
                  <div className="w-full">
                    <Link href="/snake/pvp">
                      <img className="rounded block w-full fit-cover" style={{ height: '200px' }} 
                           src="/images/PvPSnakeGame.png" alt="Two Player Snake image" />
                    </Link>
                  </div>
                </div>
              </div>
              <div className="w-full pt-3 lg:pt-5" data-aos="fade-right" data-aos-duration="500" data-aos-delay="100">
                <div className="flex flex-col lg:flex-row">
                  <div className="w-full">
                    <Link href="/snake/comp">
                      <img className="rounded block w-full fit-cover" style={{ height: '200px' }} 
                           src="/images/SnakeGame.png" alt="One Player Snake image" />
                    </Link>
                  </div>
                  <div className="py-4 lg:py-0 lg:px-4">
                    <h4 className="text-xl font-semibold mb-2"><Link href="/snake/comp" className="text-white hover:text-gray-300">One Player Snake</Link></h4>
                    <p className="desc-text mb-4">A straightforward implementation of the Snake game, designed to deepen familiarity with backend technologies while incorporating enhanced graphics for an improved gameplay experience. The application also includes a leaderboard feature to track and display top scores.</p>
                    <div className="flex flex-wrap gap-2 w-full" role="group">
                      <button className="tech tech-node" type="button">Node.js</button>
                      <button className="tech tech-websockets" type="button">Websockets</button>
                      <button className="tech tech-express" type="button">Express</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full pt-3 lg:pt-5" data-aos="fade-left" data-aos-duration="500" data-aos-delay="100">
                <div className="flex flex-col lg:flex-row">
                  <div className="order-last lg:order-first py-4 lg:py-0 lg:px-4">
                    <h4 className="text-xl font-semibold mb-2"><Link href="/textspread" className="text-white hover:text-gray-300">Text Spread Animation</Link></h4>
                    <p className="desc-text mb-4">An early engineering project made for fun, focused on animating text using particles. The project involved generating particles to form text characters and creating smooth animations. The biggest challenge was accurately converting font data into points on a canvas while maintaining the clarity of the text.</p>
                    <div className="flex flex-wrap gap-2 w-full" role="group">
                      <button className="tech tech-javascript" type="button">Javascript</button>
                    </div>
                  </div>
                  <div className="w-full">
                    <Link href="/textspread">
                      <img className="rounded block w-full fit-cover" style={{ height: '200px' }} 
                           src="/images/TextAnimation.png" alt="Text Spread Animation image" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto py-4 xl:py-5">
          <div className="w-full" data-aos="slide-up">
            <div className="w-full" id="about-me-heading-col">
              <h1 className="text-center text-4xl font-bold mb-8">More about me</h1>
            </div>
          </div>
          <div className="w-full">
            <div className="md:w-2/3 xl:w-1/2 mx-auto p-4">
              <div className="flex items-center md:items-start xl:items-center">
                <div className="bs-icon-xl bs-icon-circle bs-icon-primary flex-shrink-0 justify-center items-center mr-4 inline-block bs-icon xl"
                     data-aos="flip-left">
                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor"
                       viewBox="0 0 16 16" className="bi bi-wrench">
                    <path d="M.102 2.223A3.004 3.004 0 0 0 3.78 5.897l6.341 6.252A3.003 3.003 0 0 0 13 16a3 3 0 1 0-.851-5.878L5.897 3.781A3.004 3.004 0 0 0 2.223.1l2.141 2.142L4 4l-1.757.364L.102 2.223zm13.37 9.019.528.026.287.445.445.287.026.529L15 13l-.242.471-.026.529-.445.287-.287.445-.529.026L13 15l-.471-.242-.529-.026-.287-.445-.445-.287-.026-.529L11 13l.242-.471.026-.529.445-.287.287-.445.529-.026L13 11l.471.242z"></path>
                  </svg>
                </div>
                <div data-aos="flip-right">
                  <h4 className="text-xl font-semibold mb-2">Developer</h4>
                  <p className="desc-text">I am a dedicated developer with hands-on experience in creating web
                    applications. Through personal projects and practical learning, I've developed a solid
                    understanding of modern tools and frameworks. I mostly specialize in web development,
                    although my skills are in no way limited to it.</p>
                </div>
              </div>
              <hr className="my-5" />
              <div className="flex items-center md:items-start xl:items-center">
                <div className="bs-icon-xl bs-icon-circle bs-icon-primary flex-shrink-0 justify-center items-center order-last ml-4 inline-block bs-icon xl"
                     data-aos="flip-left">
                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor"
                       viewBox="0 0 16 16" className="bi bi-book text-white">
                    <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783"></path>
                  </svg>
                </div>
                <div data-aos="flip-left">
                  <h4 className="text-xl font-semibold mb-2">Student</h4>
                  <p className="desc-text">Driven by curiosity, I am continually expanding my knowledge in
                    software development and related fields. I embrace learning as a lifelong journey,
                    staying updated with emerging technologies and best practices.</p>
                </div>
              </div>
              <hr className="my-5" />
              <div className="flex items-center md:items-start xl:items-center">
                <div className="bs-icon-xl bs-icon-circle bs-icon-primary flex-shrink-0 justify-center items-center mr-4 inline-block bs-icon xl"
                     data-aos="flip-left">
                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor"
                       viewBox="0 0 16 16" className="bi bi-brush">
                    <path d="M15.825.12a.5.5 0 0 1 .132.584c-1.53 3.43-4.743 8.17-7.095 10.64a6.067 6.067 0 0 1-2.373 1.534c-.018.227-.06.538-.16.868-.201.659-.667 1.479-1.708 1.74a8.118 8.118 0 0 1-3.078.132 3.659 3.659 0 0 1-.562-.135 1.382 1.382 0 0 1-.466-.247.714.714 0 0 1-.204-.288.622.622 0 0 1 .004-.443c.095-.245.316-.38.461-.452.394-.197.625-.453.867-.826.095-.144.184-.297.287-.472l.117-.198c.151-.255.326-.54.546-.848.528-.739 1.201-.925 1.746-.896.126.007.243.025.348.048.062-.172.142-.38.238-.608.261-.619.658-1.419 1.187-2.069 2.176-2.67 6.18-6.206 9.117-8.104a.5.5 0 0 1 .596.04zM4.705 11.912a1.23 1.23 0 0 0-.419-.1c-.246-.013-.573.05-.879.479-.197.275-.355.532-.5.777l-.105.177c-.106.181-.213.362-.32.528a3.39 3.39 0 0 1-.76.861c.69.112 1.736.111 2.657-.12.559-.139.843-.569.993-1.06a3.122 3.122 0 0 0 .126-.75l-.793-.792zm1.44.026c.12-.04.277-.1.458-.183a5.068 5.068 0 0 0 1.535-1.1c1.9-1.996 4.412-5.57 6.052-8.631-2.59 1.927-5.566 4.66-7.302 6.792-.442.543-.795 1.243-1.042 1.826-.121.288-.214.54-.275.72v.001l.575.575zm-4.973 3.04.007-.005a.031.031 0 0 1-.007.004zm3.582-3.043.002.001h-.002z"></path>
                  </svg>
                </div>
                <div data-aos="flip-right">
                  <h4 className="text-xl font-semibold mb-2">Enthusiast</h4>
                  <p className="desc-text">As an engineer, I'm deeply passionate about technology and its
                    potential to solve real-world problems. I love exploring new tools, staying updated on
                    industry trends, and experimenting with innovative ideas to push the boundaries of
                    what's possible.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

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

      <footer className="text-center">
        <div className="container mx-auto text-gray-400 py-4 lg:py-5">
          <ul className="flex flex-wrap justify-center gap-4 mb-4">
            <li><a className="text-gray-400 hover:text-white transition-colors" href="https://test.joonaslindroos.com">Fax or Cap</a></li>
            <li><Link href="/snake/pvp" className="text-gray-400 hover:text-white transition-colors">Versus Snake</Link></li>
            <li><a className="text-gray-400 hover:text-white transition-colors" href="#">Skibidify (WIP)</a></li>
          </ul>
          <ul className="flex justify-center gap-4 mb-4">
            <li>
              <a href="https://github.com/johottaja" className="text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" fill="currentColor"
                     viewBox="0 0 16 16" className="bi bi-github">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8"></path>
                </svg>
              </a>
            </li>
            <li>
              <a href="https://www.linkedin.com/in/joonas-lindroos-917280230/" className="text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" fill="currentColor"
                     viewBox="0 0 16 16" className="bi bi-linkedin">
                  <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401m-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4"></path>
                </svg>
              </a>
            </li>
          </ul>
          <p className="mb-0">Joonas Lindroos</p>
        </div>
      </footer>
    </>
  )
}
