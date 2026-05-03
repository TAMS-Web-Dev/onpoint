'use client'

import { Suspense, startTransition, useActionState, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { signIn, type AuthState } from '../actions'

const SignInSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
})

type SignInValues = z.infer<typeof SignInSchema>

function SignInForm() {
  const [state, dispatch, isPending] = useActionState<AuthState, FormData>(
    signIn,
    { error: null }
  )
  const [showPassword, setShowPassword] = useState(false)
  const searchParams = useSearchParams()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInValues>({
    resolver: zodResolver(SignInSchema),
  })

  useEffect(() => {
    if (state.error) {
      toast.error(state.error)
    }
  }, [state])

  useEffect(() => {
    if (searchParams.get('message') === 'check-email') {
      toast.success('Account created! Please check your email to confirm.')
    }
  }, [searchParams])

  function onSubmit(values: SignInValues) {
    const formData = new FormData()
    formData.set('email', values.email)
    formData.set('password', values.password)
    startTransition(() => dispatch(formData))
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-2xl px-8 py-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/assets/onpoint-logo-icon-orange-with-blue-type.png"
            alt="OnPoint"
            width={160}
            height={48}
            priority
          />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-extrabold text-[#2D1D44] text-center mb-1">
          Welcome Back
        </h1>
        <p className="text-sm text-gray-500 text-center mb-8">
          Sign in to your OnPoint account
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {/* Email */}
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
              {...register('email')}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF790E] focus:border-transparent transition"
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-[#2D1D44] mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                {...register('password')}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF790E] focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
            )}
            <div className="flex justify-end mt-1.5">
              <Link
                href="/forgot-password"
                className="text-xs text-[#FF790E] hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#FF790E] hover:bg-[#e56d0d] text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {isPending && <Loader2 size={16} className="animate-spin" />}
            {isPending ? 'Signing In…' : 'Sign In'}
          </button>
        </form>

        {/* Footer link */}
        <p className="text-sm text-gray-500 text-center mt-6">
          Don&apos;t have an account?{' '}
          <Link
            href="/sign-up"
            className="text-[#FF790E] font-semibold hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  )
}
