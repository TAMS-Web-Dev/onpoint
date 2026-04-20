import Link from 'next/link'
import { ShieldCheck, LogOut } from 'lucide-react'
import { signOut } from '@/app/(auth)/actions'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted flex flex-col">
      <header className="bg-[#2D1D44] border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto h-14 flex items-center justify-between px-4 lg:px-8">
          <Link href="/admin" className="flex items-center gap-2.5 select-none">
            <ShieldCheck size={20} className="text-[#FF790E]" />
            <span className="font-extrabold text-white tracking-tight">
              OnPoint <span className="text-[#FF790E]">Admin</span>
            </span>
          </Link>

          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-1.5 text-sm font-medium text-white/60 hover:text-white transition-colors"
            >
              <LogOut size={15} />
              Logout
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
