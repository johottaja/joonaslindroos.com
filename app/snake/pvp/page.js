'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SnakePvP() {
  const router = useRouter()
  const [code, setCode] = useState('')

  useEffect(() => {
    // Load code from cookie on mount
    const getCookie = (name) => {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop().split(';').shift()
    }
    const savedCode = getCookie('code')
    if (savedCode) {
      setCode(savedCode)
    }
  }, [])

  const handleJoin = (e) => {
    e.preventDefault()
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
    <div className="main">
      <div className="message-box" style={{ display: 'block', padding: '40px' }}>
        <h2 style={{ 
          marginBottom: '40px', 
          fontSize: '2.5em', 
          fontWeight: 'bold',
          color: '#ffffff',
          textAlign: 'center'
        }}>
          Two Player Snake
        </h2>
        
        <form onSubmit={handleJoin} autoComplete="off" style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ marginBottom: '25px' }}>
            <label htmlFor="inputCode" style={{ 
              display: 'block', 
              marginBottom: '12px', 
              fontSize: '1.2em',
              color: '#ffffff',
              fontWeight: '500'
            }}>
              Enter Game Code
            </label>
            <input 
              name="code" 
              type="text" 
              className="form-control code-input" 
              id="inputCode"
              placeholder="Enter code to join game" 
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{
                width: '100%',
                padding: '15px 20px',
                fontSize: '18px',
                borderRadius: '8px',
                border: '2px solid rgba(255, 255, 255, 0.5)',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                color: 'white',
                marginBottom: '20px',
                outline: 'none'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '12px', marginBottom: '15px' }}>
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{
                flex: 1,
                padding: '16px 24px',
                fontSize: '18px',
                fontWeight: 'bold',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#4CAF50',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#45a049'
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 6px 8px rgba(0, 0, 0, 0.4)'
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#4CAF50'
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)'
              }}
            >
              Join Game
            </button>
            <button 
              type="button" 
              onClick={handleCreate} 
              className="btn btn-primary"
              style={{
                flex: 1,
                padding: '16px 24px',
                fontSize: '18px',
                fontWeight: 'bold',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#4CAF50',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#45a049'
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 6px 8px rgba(0, 0, 0, 0.4)'
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#4CAF50'
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)'
              }}
            >
              Create Game
            </button>
          </div>
          
          <div style={{ marginTop: '15px' }}>
            <button 
              type="button" 
              onClick={handleLocal} 
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '16px 24px',
                fontSize: '18px',
                fontWeight: 'bold',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#4CAF50',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#45a049'
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 6px 8px rgba(0, 0, 0, 0.4)'
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#4CAF50'
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)'
              }}
            >
              Play Local (Same Computer)
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
