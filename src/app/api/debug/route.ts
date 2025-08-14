import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const debug = searchParams.get('key')
  
  // Simple debug key check
  if (debug !== 'debug123') {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  const databaseUrl = process.env.DATABASE_URL
  
  return NextResponse.json({
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    DATABASE_URL_PREVIEW: databaseUrl ? databaseUrl.substring(0, 80) + '...' : 'NOT SET',
    DATABASE_URL_LENGTH: databaseUrl ? databaseUrl.length : 0,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
    ALL_ENV_KEYS: Object.keys(process.env).filter(key => key.includes('DATABASE') || key.includes('NEXTAUTH'))
  })
}