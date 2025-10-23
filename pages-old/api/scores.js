import fs from 'fs'
import path from 'path'

const dataFile = path.join(process.cwd(), 'data', 'highscores.json')

async function getHighscores() {
  try {
    const data = await fs.promises.readFile(dataFile, 'utf-8')
    if (!data) return []
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const highscores = await getHighscores()
    const score = req.body.score

    if (highscores.length < 5) {
      return res.status(200).end()
    }

    for (let i = 0; i < highscores.length; i++) {
      if (score > parseInt(highscores[i].score)) {
        return res.status(200).end()
      }
    }
    return res.status(204).end()
  } catch (error) {
    console.error('Error checking score:', error)
    return res.status(500).json({ message: 'Error checking score' })
  }
}
