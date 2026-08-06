/**
 * Norto — Production NextAuth.js configuration template.
 *
 * The app ships with a fully-working simulated Google sign-in flow
 * (see src/components/auth/sign-in-dialog.tsx) so the feature is
 * demonstrable without real OAuth credentials.
 *
 * To switch to REAL Google OAuth in production, follow these steps:
 *
 * 1. Install NextAuth (already in package.json as `next-auth` v4).
 *
 * 2. Create a Google OAuth 2.0 client in Google Cloud Console
 *    (https://console.cloud.google.com/apis/credentials) and set these
 *    env vars in your deployment:
 *      GOOGLE_CLIENT_ID=...
 *      GOOGLE_CLIENT_SECRET=...
 *      NEXTAUTH_URL=https://your-domain.com
 *      NEXTAUTH_SECRET=...           # generate: `openssl rand -base64 32`
 *
 * 3. Create the catch-all NextAuth route at:
 *      src/app/api/auth/[...nextauth]/route.ts
 *    with the contents of `NextAuthHandler` shown below.
 *
 * 4. Replace `handleGoogleClick` in sign-in-dialog.tsx with a redirect
 *    to the NextAuth sign-in endpoint:
 *      signIn('google', { callbackUrl: '/?auth=1' })
 *
 * 5. In src/app/page.tsx, read the session (getServerSession) and hydrate
 *    the Zustand store's `user` from the session on first load.
 *
 * The rest of the app (store.signIn/signOut, profile, topbar) stays
 * unchanged because it already operates on the unified `user` shape.
 */

/*
import NextAuth, { type NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from '@/lib/db'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).id = token.id
      return session
    },
  },
  pages: {
    signIn: '/?auth=1',
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
*/
