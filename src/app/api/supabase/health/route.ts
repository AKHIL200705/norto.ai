import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'

export async function GET() {
  const status: {
    supabaseAuth: string
    databaseUrlConfigured: boolean
    prismaDatabaseConnection: string
    timestamp: string
    details: {
      supabaseUrlSet: boolean
      supabaseAnonKeySet: boolean
      userCount?: number
      error?: string
    }
  } = {
    supabaseAuth: 'checking',
    databaseUrlConfigured: false,
    prismaDatabaseConnection: 'checking',
    timestamp: new Date().toISOString(),
    details: {
      supabaseUrlSet: false,
      supabaseAnonKeySet: false,
    },
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  status.details.supabaseUrlSet = !!supabaseUrl && !supabaseUrl.includes('your-project-id')
  status.details.supabaseAnonKeySet = !!supabaseAnonKey && !supabaseAnonKey.includes('your-anon-key')
  status.databaseUrlConfigured = !!process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('your-project-ref')

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      status.supabaseAuth = `Error: ${error.message}`
    } else {
      status.supabaseAuth = data.session ? 'Connected (Active Session)' : 'Connected (No Active Session)'
    }
  } catch (err: unknown) {
    status.supabaseAuth = err instanceof Error ? `Failed: ${err.message}` : 'Failed'
  }

  try {
    const count = await db.user.count()
    status.prismaDatabaseConnection = 'Connected'
    status.details.userCount = count
  } catch (err: unknown) {
    status.prismaDatabaseConnection = status.databaseUrlConfigured
      ? `Connection Error: ${err instanceof Error ? err.message : 'Could not query database'}`
      : 'Not Configured (Defaulting to placeholder DATABASE_URL in .env)'
    status.details.error = err instanceof Error ? err.message : String(err)
  }

  return NextResponse.json(status, {
    status: status.details.supabaseUrlSet && status.databaseUrlConfigured ? 200 : 200,
  })
}
