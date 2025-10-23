import fs from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

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

export async function GET() {
  try {
    const highscores = await highscoreService.getData()
    return NextResponse.json(highscores)
  } catch (error) {
    console.error('Error getting highscores:', error)
    return NextResponse.json({ message: 'Error retrieving highscores' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, message, score } = body

    // Validation
    if (!name || !message || !score) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    if (name.length < 3 || name.length > 30) {
      return NextResponse.json({ message: 'Name is invalid' }, { status: 400 })
    }

    if (message.length < 3 || message.length > 150) {
      return NextResponse.json({ message: 'Message is invalid' }, { status: 400 })
    }

    if (score.length < 1 || score.length > 3) {
      return NextResponse.json({ message: 'Score is invalid' }, { status: 400 })
    }

    await highscoreService.setNewHighscore({ name, message, score })
    return NextResponse.json({ message: 'Highscore saved successfully' })
  } catch (error) {
    console.error('Error saving highscore:', error)
    return NextResponse.json({ message: 'Error saving highscore' }, { status: 500 })
  }
}
