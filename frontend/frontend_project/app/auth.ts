import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { authOptions } from "./api/auth/[...nextauth]/auth-options"

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authOptions,
  pages: authConfig.pages,
})
