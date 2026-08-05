import { db } from './db'
import { v4 as uuid } from 'uuid'

// Default demo user — Norto uses a lightweight local session model.
// A real deployment would wire NextAuth here; for this build we ensure a
// single demo user always exists so every feature works out of the box.
const DEMO_EMAIL = 'explorer@norto.ai'

export async function getOrCreateDemoUser() {
  let user = await db.user.findUnique({ where: { email: DEMO_EMAIL } })
  if (!user) {
    user = await db.user.create({
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
  return user
}

export function newId() {
  return uuid()
}
