'use client'

import { useSession } from 'next-auth/react'
import { Shield } from 'lucide-react'

export default function AdminBanner() {
  const { data: session } = useSession()

  if (session?.user?.role !== 'ADMIN') return null

  return (
    <div className="mb-6 flex items-center gap-3 rounded-lg border border-xebia-velvet/20 bg-[#F3E8F1] px-4 py-3">
      <Shield className="h-4 w-4 shrink-0 text-xebia-velvet" />
      <p className="flex-1 text-sm text-xebia-velvet-dark">
        <span className="font-semibold">Admin view:</span> You are viewing the global course
        library.
      </p>
      <span className="rounded bg-xebia-velvet px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
        Admin
      </span>
    </div>
  )
}
