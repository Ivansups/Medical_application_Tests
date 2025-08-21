import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions, Session } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const tokenResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: credentials?.email,
              password: credentials?.password
            })
          });

          if (!tokenResponse.ok) throw new Error("Invalid credentials");

          const tokenData = await tokenResponse.json();

          const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`, {
            headers: {
              "Authorization": `Bearer ${tokenData.access_token}`
            }
          });

          if (!userResponse.ok) throw new Error("Failed to fetch user");

          const userData = await userResponse.json();

          return {
            id: userData.id,
            email: userData.email,
            is_admin: userData.is_admin,
            access_token: tokenData.access_token
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.is_admin = user.is_admin;
        token.access_token = user.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.is_admin = token.is_admin;
      session.access_token = token.access_token;
      return session;
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error"
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };