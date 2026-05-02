import Image from 'next/image'
import Link from 'next/link'
import { MailCheck } from 'lucide-react'

export default function CheckEmailPage() {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-2xl px-8 py-10 text-center">
        <div className="flex justify-center mb-6">
          <Image
            src="/assets/onpoint-logo-icon-orange-with-blue-type.png"
            alt="OnPoint"
            width={160}
            height={48}
            priority
          />
        </div>

        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <MailCheck size={28} className="text-primary" />
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-[#2D1D44] mb-2">
          Check your email
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-8">
          Please click the link we sent you to verify your account before signing in.
        </p>

        <Link
          href="/sign-in"
          className="text-sm text-[#FF790E] font-semibold hover:underline"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  )
}
