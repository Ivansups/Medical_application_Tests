This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## NextAuth.js Setup

This project includes NextAuth.js v5 for authentication. The basic setup is already configured.

### What's Already Added:

✅ **Core NextAuth Files:**
- `app/auth.ts` - main NextAuth configuration
- `app/auth.config.ts` - page configuration and middleware
- `app/api/auth/[...nextauth]/route.ts` - required API route
- `types/next-auth.d.ts` - TypeScript types
- `components/AuthStatus.tsx` - demo authentication component

✅ **Updated Files:**
- `app/layout.tsx` - added SessionProvider
- `app/page.tsx` - added AuthStatus component

### What You Need to Do:

1. **Create `.env.local` file in the project root:**
```env
# NextAuth Configuration
AUTH_SECRET="your-secret-key-here" # Replace with your secret key
AUTH_URL="http://localhost:3000"

# Database URL (if using database)
# DATABASE_URL="your-database-url"

# OAuth Providers (add as needed)
# GOOGLE_CLIENT_ID="your-google-client-id"
# GOOGLE_CLIENT_SECRET="your-google-client-secret"
# GITHUB_CLIENT_ID="your-github-client-id"
# GITHUB_CLIENT_SECRET="your-github-client-secret"
```

2. **Generate AUTH_SECRET:**
```bash
openssl rand -base64 32
```

3. **Add authentication providers in `app/auth.ts`:**

For Google OAuth:
```typescript
import Google from "next-auth/providers/google"

// In providers array:
Google({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
})
```

For Credentials (email/password):
```typescript
import Credentials from "next-auth/providers/credentials"

// In providers array:
Credentials({
  name: "credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" }
  },
  async authorize(credentials) {
    // Your user verification logic here
    // Return null if user not found
    // Return user object if found
  }
})
```

4. **Create authentication pages (optional):**
Create `app/auth/` folder and add pages:
- `app/auth/signin/page.tsx` - sign in page
- `app/auth/signout/page.tsx` - sign out page
- `app/auth/error/page.tsx` - error page

### Useful Hooks and Functions:

- `useSession()` - get session data
- `signIn()` - sign in
- `signOut()` - sign out
- `getServerSession()` - get session on server

### Documentation:

- [NextAuth.js v5 Documentation](https://next-auth.js.org/)
- [NextAuth.js v5 Migration Guide](https://next-auth.js.org/getting-started/upgrade-v5)
