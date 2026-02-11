'use client'

import { useRouter } from 'next/navigation'
import Script from 'next/script'

export default function SnakePvP() {
  const router = useRouter()

  const handleJoin = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const code = formData.get('code')
    if (code) {
      // Store code in cookie so the game page can read it
      document.cookie = `code=${code};path=/;max-age=${30 * 24 * 60 * 60}`
      router.push(`/snake/pvp/game?code=${code}`)
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
      <Script src="/games/snake/pvp/js/landing.js" strategy="afterInteractive" />
      <Script src="/games/snake/pvp/js/CookieUtil.js" strategy="afterInteractive" />
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
