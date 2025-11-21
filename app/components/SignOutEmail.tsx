'use client'
import { signOut } from 'next-auth/react'

export default function SignOutEmail({ email }: { email: string }) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      title="Sign out"
      className="text-xs md:text-sm cursor-pointer"
    >
      Sign out ({email})
    </button>
  )
}
