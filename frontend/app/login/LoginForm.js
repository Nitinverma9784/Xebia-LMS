'use client'

import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { BookOpen, Shield, Users } from 'lucide-react'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('Invalid email or password')
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-xebia-velvet-dark p-12 text-white lg:flex">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-lg font-bold">
              X
            </div>
            <div>
              <p className="font-semibold">Xebia Academy</p>
              <p className="text-xs text-white/60">Enterprise LMS</p>
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-4xl font-bold leading-tight">
            Learn. Build. Lead.
          </h1>
          <p className="mt-4 max-w-md text-white/75">
            Access world-class courses, learning paths, and trainer resources across
            your organisation.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { icon: BookOpen, text: 'Structured course catalogues' },
              { icon: Users, text: 'Role-based access for teams' },
              { icon: Shield, text: 'Secure SSO & JWT authentication' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-white/80">
                <Icon className="h-4 w-4 text-xebia-emerald" />
                {text}
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-white/40">© Xebia. All rights reserved.</p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-xebia-bg p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-xebia-velvet text-sm font-bold text-white">
                X
              </div>
              <span className="font-semibold text-xebia-velvet-dark">Xebia Academy</span>
            </div>
          </div>

          <div className="rounded-2xl border border-xebia-border bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-foreground">Sign in</h2>
            <p className="mt-2 text-sm text-xebia-muted">
              Enter your credentials to access the platform.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@xebia.com"
                  className="w-full rounded-lg border border-xebia-border bg-xebia-bg px-3 py-2.5 text-sm outline-none focus:border-xebia-velvet focus:ring-2 focus:ring-xebia-velvet/20"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-xebia-border bg-xebia-bg px-3 py-2.5 text-sm outline-none focus:border-xebia-velvet focus:ring-2 focus:ring-xebia-velvet/20"
                  required
                />
              </div>

              {error ? (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-xebia-velvet py-2.5 text-sm font-semibold text-white hover:bg-xebia-velvet-bright disabled:opacity-60"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="mt-6 rounded-lg bg-xebia-bg p-4 text-xs text-xebia-muted">
              <p className="font-semibold text-foreground">Demo accounts</p>
              <p className="mt-2">admin@xebia.com · instructor@xebia.com · student@xebia.com</p>
              <p>Password: Password123!</p>
            </div>

            <p className="mt-6 text-center text-sm text-xebia-muted">
              <Link href="/courses" className="font-medium text-xebia-velvet hover:underline">
                Browse courses without signing in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
