import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    // Здесь вы добавите провайдеры аутентификации
    // Например: Google, GitHub, Credentials и т.д.
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})
