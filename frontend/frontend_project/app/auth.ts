import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  
  // Провайдеры аутентификации
  // Здесь нужно добавить провайдеры, которые вы хотите использовать
  providers: [
    // Пример для Google OAuth:
    // Google({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // }),
    
    // Пример для GitHub OAuth:
    // GitHub({
    //   clientId: process.env.GITHUB_CLIENT_ID!,
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    // }),
    
    // Пример для Credentials (email/password):
    // Credentials({
    //   name: "credentials",
    //   credentials: {
    //     email: { label: "Email", type: "email" },
    //     password: { label: "Password", type: "password" }
    //   },
    //   async authorize(credentials) {
    //     // Здесь ваша логика проверки пользователя
    //     // 1. Найти пользователя в базе данных по email
    //     // 2. Проверить пароль (bcrypt.compare)
    //     // 3. Вернуть объект пользователя или null
    //   }
    // }),
  ],
  
  // Адаптер для базы данных (если используете)
  // adapter: PrismaAdapter(prisma),
  
  // Callbacks для настройки JWT и сессий
  callbacks: {
    // JWT callback - вызывается при создании JWT токена
    async jwt({ token, user, account }) {
      // Если это первый вход пользователя
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        // Можно добавить дополнительные поля
        // token.role = user.role
      }
      
      // Если это OAuth провайдер, можно сохранить access_token
      if (account) {
        token.accessToken = account.access_token
      }
      
      return token
    },
    
    // Session callback - вызывается при получении сессии
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        // Можно добавить дополнительные поля
        // session.user.role = token.role as string
      }
      return session
    },
    
    // SignIn callback - вызывается при успешном входе
    async signIn({ user, account, profile }) {
      // Здесь можно добавить дополнительную логику
      // Например, проверку домена email, создание пользователя и т.д.
      return true
    },
    
    // Redirect callback - вызывается при редиректах
    async redirect({ url, baseUrl }) {
      // Можно настроить куда перенаправлять после входа/выхода
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  
  // Настройки сессий
  session: {
    strategy: "jwt", // или "database" если используете адаптер
    maxAge: 30 * 24 * 60 * 60, // 30 дней
  },
  
  // Настройки JWT
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 дней
  },
  
  // Дополнительные настройки
  debug: process.env.NODE_ENV === "development",
})
