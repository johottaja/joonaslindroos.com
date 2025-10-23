import fs from 'fs'
import path from 'path'

const dataFile = path.join(process.cwd(), 'data', 'highscores.json')

class HighscoreService {
  constructor(dataFile) {
    this.dataFile = dataFile
  }

  async setData(data) {
    await fs.promises.writeFile(this.dataFile, JSON.stringify(data, null, 4))
  }

  async getData() {
    try {
      const data = await fs.promises.readFile(this.dataFile, 'utf-8')
      if (!data) return []
      return JSON.parse(data)
    } catch (error) {
      return []
    }
  }

  async setNewHighscore(highscore) {
    highscore.name = highscore.name.replace(/\p{M}/gu, '')
    highscore.message = highscore.message.replace(/\p{M}/gu, '')

    const data = await this.getData()
    if (data.length === 0) {
      data.splice(0, 0, highscore)
    } else {
      for (let i = 0; i < 5; i++) {
        if (data.length === i || parseInt(highscore.score) > parseInt(data[i].score)) {
          data.splice(i, 0, highscore)
          break
        }
      }
    }
    if (data.length > 5) data.pop()
    await this.setData(data)
  }
}

const highscoreService = new HighscoreService(dataFile)

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const highscores = await highscoreService.getData()
      return res.status(200).json(highscores)
    } catch (error) {
      console.error('Error getting highscores:', error)
      return res.status(500).json({ message: 'Error retrieving highscores' })
    }
  }

  if (req.method === 'POST') {
    const { name, message, score } = req.body

    // Validation
    if (!name || !message || !score) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    if (name.length < 3 || name.length > 30) {
      return res.status(400).json({ message: 'Name is invalid' })
    }

    if (message.length < 3 || message.length > 150) {
      return res.status(400).json({ message: 'Message is invalid' })
    }

    if (score.length < 1 || score.length > 3) {
      return res.status(400).json({ message: 'Score is invalid' })
    }

    try {
      await highscoreService.setNewHighscore({ name, message, score })
      return res.status(200).json({ message: 'Highscore saved successfully' })
    } catch (error) {
      console.error('Error saving highscore:', error)
      return res.status(500).json({ message: 'Error saving highscore' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
