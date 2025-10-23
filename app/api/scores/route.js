import fs from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

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

export async function POST(request) {
  try {
    const body = await request.json()
    const highscores = await getHighscores()
    const score = body.score

    if (highscores.length < 5) {
      return new NextResponse(null, { status: 200 })
    }

    for (let i = 0; i < highscores.length; i++) {
      if (score > parseInt(highscores[i].score)) {
        return new NextResponse(null, { status: 200 })
      }
    }
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error checking score:', error)
    return NextResponse.json({ message: 'Error checking score' }, { status: 500 })
  }
}
