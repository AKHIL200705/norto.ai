import { db } from './db'
import { createClient } from './supabase/server'
import { v4 as uuid } from 'uuid'

const DEMO_EMAIL = 'explorer@norto.ai'

/**
 * Gets the current authenticated user from Supabase cookies,
 * or falls back to the persistent demo user so every feature works out of the box.
 */
export async function getOrCreateDemoUser() {
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    if (data && data.user && data.user.email) {
      const email = data.user.email
      let dbUser = await db.user.findUnique({ where: { email } })
      if (!dbUser) {
        dbUser = await db.user.create({
          data: {
            email,
            name: data.user.user_metadata?.name || email.split('@')[0],
            avatar: data.user.user_metadata?.avatar_url || null,
            language: 'English',
            budget: 25000,
            city: 'Hyderabad',
          },
        })
      }
      return dbUser
    }
  } catch {
    // fallback to demo user
  }

  let demoUser = await db.user.findUnique({ where: { email: DEMO_EMAIL } })
  if (!demoUser) {
    demoUser = await db.user.create({
      data: {
        email: DEMO_EMAIL,
        name: 'City Explorer',
        occupation: 'Software Engineer',
        language: 'English',
        budget: 25000,
        foodPref: 'Vegetarian',
        transport: 'Public',
        city: 'Hyderabad',
      },
    })
  }
  return demoUser
}

export function newId() {
  return uuid()
}
