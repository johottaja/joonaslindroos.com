import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({ message: 'Score qualification is determined by the game server.' }, { status: 403 })
}
