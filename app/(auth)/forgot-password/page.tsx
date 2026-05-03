'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Loader2, MailCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const trimmed = email.trim()
    if (!trimmed) {
      setError('Please enter your email address.')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error: sbError } = await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
      })
      if (sbError) throw sbError
      setSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-2xl px-8 py-10">
        <div className="flex justify-center mb-8">
          <Image
            src="/assets/onpoint-logo-icon-orange-with-blue-type.png"
            alt="OnPoint"
            width={160}
            height={48}
            priority
          />
        </div>

        {sent ? (
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <MailCheck size={26} className="text-green-600" />
            </div>
            <h1 className="text-xl font-extrabold text-[#2D1D44] mb-2">Check your email</h1>
            <p className="text-sm text-gray-500 mb-6">
              We&apos;ve sent a password reset link to <span className="font-semibold text-gray-700">{email}</span>.
              Check your inbox and follow the link to reset your password.
            </p>
            <Link href="/sign-in" className="text-sm text-[#FF790E] font-semibold hover:underline">
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-extrabold text-[#2D1D44] text-center mb-1">
              Forgot Password?
            </h1>
            <p className="text-sm text-gray-500 text-center mb-8">
              Enter your email and we&apos;ll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-[#2D1D44] mb-1.5"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF790E] focus:border-transparent transition"
                />
                {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FF790E] hover:bg-[#e56d0d] text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>

            <p className="text-sm text-gray-500 text-center mt-6">
              <Link href="/sign-in" className="text-[#FF790E] font-semibold hover:underline">
                Back to Sign In
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
