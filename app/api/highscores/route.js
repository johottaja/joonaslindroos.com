import path from 'node:path'
import { NextResponse } from 'next/server'
import HighscoreService from '../../../HighscoreService'

export const dynamic = 'force-dynamic'
const highscoreService = new HighscoreService(path.join(process.cwd(), 'data', 'highscores.json'))

export async function GET() {
  try {
    return NextResponse.json(await highscoreService.getData(), {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    console.error('Error getting highscores:', error)
    return NextResponse.json({ message: 'Error retrieving highscores' }, { status: 500 })
  }
}

export async function POST() {
  return NextResponse.json({ message: 'Scores must be earned and submitted through a game session.' }, { status: 403 })
}
