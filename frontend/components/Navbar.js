'use client'

import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'

export default function Navbar() {
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated'

  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-xl font-bold text-indigo-600">
          Xebia LMS
        </Link>

        <nav className="flex items-center gap-4 text-sm font-medium text-zinc-700">
          <Link href="/courses" className="hover:text-indigo-600">
            Courses
          </Link>
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="hover:text-indigo-600">
                Dashboard
              </Link>
              <span className="hidden text-zinc-500 sm:inline">
                {session.user?.name} ({session.user?.role})
              </span>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="rounded-lg bg-zinc-900 px-3 py-1.5 text-white hover:bg-zinc-700"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-500"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
