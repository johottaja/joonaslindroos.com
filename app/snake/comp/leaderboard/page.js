'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Leaderboard() {
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const response = await fetch('/api/highscores')
        const data = await response.json()
        setScores(data)
      } catch (error) {
        console.error('Error fetching scores:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchScores()
  }, [])

  const handlePlayClick = () => {
    router.push('/snake/comp')
  }

  if (loading) {
    return (
      <>
        <div className="main">
          <div className="leaderboard">
            <div className="container-fluid">
              <div className="row">
                <div className="col-12">
                  <p>Loading...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="main">
        <div className="leaderboard">
          <div className="container-fluid">
            {scores.length > 0 ? (
              <>
                <div className="row leader">
                  <div className="col-12 leaderboard-col">
                    <div className="leaderboard-item">
                      <div className="leader-score">{scores[0].score}</div>
                      <div className="leader-name-wrapper">
                        <div className="leader-name">
                          {scores[0].name}
                        </div>
                      </div>
                      <div className="leader-message-wrapper">
                        <div className="leader-message">
                          {scores[0].message}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {scores.length > 1 && (
                  <div className="row not-leader">
                    <div className="col-md-6 col-sm-12 leaderboard-col">
                      <div className="leaderboard-item">
                        <div className="not-leader-score">{scores[1].score}</div>
                        <div className="not-leader-name-wrapper">
                          <div className="not-leader-name">
                            {scores[1].name}
                          </div>
                        </div>
                        <div className="not-leader-message-wrapper">
                          <div className="not-leader-message">
                            {scores[1].message}
                          </div>
                        </div>
                      </div>
                    </div>
                    {scores.length > 2 && (
                      <div className="col-md-6 col-sm-12 leaderboard-col">
                        <div className="leaderboard-item">
                          <div className="not-leader-score">{scores[2].score}</div>
                          <div className="not-leader-name-wrapper">
                            <div className="not-leader-name">
                              {scores[2].name}
                            </div>
                          </div>
                          <div className="not-leader-message-wrapper">
                            <div className="not-leader-message">
                              {scores[2].message}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {scores.length > 3 && (
                  <div className="row not-leader">
                    <div className="col-md-6 col-sm-12 leaderboard-col">
                      <div className="leaderboard-item">
                        <div className="not-leader-score">{scores[3].score}</div>
                        <div className="not-leader-name-wrapper">
                          <div className="not-leader-name">
                            {scores[3].name}
                          </div>
                        </div>
                        <div className="not-leader-message-wrapper">
                          <div className="not-leader-message">
                            {scores[3].message}
                          </div>
                        </div>
                      </div>
                    </div>
                    {scores.length > 4 && (
                      <div className="col-md-6 col-sm-12 leaderboard-col">
                        <div className="leaderboard-item">
                          <div className="not-leader-score">{scores[4].score}</div>
                          <div className="not-leader-name-wrapper">
                            <div className="not-leader-name">
                              {scores[4].name}
                            </div>
                          </div>
                          <div className="not-leader-message-wrapper">
                            <div className="not-leader-message">
                              {scores[4].message}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="row">
                <div className="col-12">
                  <p>No scores yet. Be the first to play!</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <button id="play-button" className="play-button" onClick={handlePlayClick}>Play</button>
      </div>
    </>
  )
}
