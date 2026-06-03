import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.name = user.name
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.name = token.name as string
        session.user.email = token.email as string
      }
      return session
    },
  },
  providers: [], // Add providers in auth.ts (Node.js runtime environment)
} satisfies NextAuthConfig
