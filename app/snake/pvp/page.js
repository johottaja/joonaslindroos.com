'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SnakePvP() {
  const router = useRouter()

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
        await loadScript('/games/snake/pvp/js/landing.js')
        await loadScript('/games/snake/pvp/js/CookieUtil.js')
      } catch (error) {
        console.error('Error loading scripts:', error)
      }
    }

    loadScripts()
  }, [])

  const handleJoin = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const code = formData.get('code')
    if (code) {
      router.push(`/snake/pvp/join?code=${code}`)
    }
  }

  const handleCreate = (e) => {
    e.preventDefault()
    router.push('/snake/pvp/create')
  }

  const handleLocal = (e) => {
    e.preventDefault()
    router.push('/snake/pvp/local')
  }

  return (
    <>
      <div className="main">
        <div className="message-box">
          <form onSubmit={handleJoin} autoComplete="off">
            <div className="form-inline">
              <div className="form-group">
                <input name="code" type="text" className="form-control code-input" id="inputCode"
                       placeholder="code" defaultValue="" />
              </div>
              <button type="submit" className="btn btn-primary">Join</button>
              <button type="button" onClick={handleCreate} className="btn btn-primary">Create</button>
            </div>
            <div className="form-group">
              <button type="button" onClick={handleLocal} className="btn-btn btn-primary">Local</button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
