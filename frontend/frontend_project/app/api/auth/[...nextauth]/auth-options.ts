import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";

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
          // Use Docker service name for server-side requests, fallback to public URL for client-side
          const apiBaseUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
          
          const loginResponse = await fetch(`${apiBaseUrl}/api/v1/auth/login`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials?.email || "",
              password: credentials?.password || "",
            }),
          });

          if (!loginResponse.ok) {
            console.error("Login response error:", await loginResponse.text());
            return null;
          }

          const loginData = await loginResponse.json();
          
          const userResponse = await fetch(`${apiBaseUrl}/api/v1/auth/me`, {
            headers: {
              "Authorization": `Bearer ${loginData.access_token}`
            }
          });

          if (!userResponse.ok) {
            console.error("User response error:", await userResponse.text());
            return null;
          }

          const userData = await userResponse.json();
          
          return {
            id: userData.id || credentials?.email || "",
            email: userData.email || credentials?.email || "",
            is_admin: userData.is_admin || false,
            access_token: loginData.access_token
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
      if (session.user) {
        session.user.id = token.id as string;
        session.user.is_admin = token.is_admin as boolean;
      }
      session.access_token = token.access_token as string;
      return session;
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error"
  }
};
