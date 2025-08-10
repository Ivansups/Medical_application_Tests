'use client'

import { useSession, signIn, signOut } from "next-auth/react"

export default function AuthStatus() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (status === "authenticated") {
    return (
      <div>
        <p>Signed in as {session.user?.email}</p>
        <button onClick={() => signOut()}>Sign out</button>
      </div>
    )
  }

  return (
    <div>
      <p>Not signed in</p>
      <button onClick={() => signIn()}>Sign in</button>
    </div>
  )
}
