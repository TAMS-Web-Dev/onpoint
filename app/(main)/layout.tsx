import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AskOnPointWidget from '@/components/AskOnPointWidget'
import { getCurrentUserWithProfile } from '@/lib/db/profile'

function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { profile } = await getCurrentUserWithProfile()
  const initials = profile ? getInitials(profile.full_name) : null
  const isLoggedIn = !!profile

  return (
    <>
      <Navbar initials={initials} />
      {children}
      <AskOnPointWidget isLoggedIn={isLoggedIn} />
      <Footer isLoggedIn={isLoggedIn} />
    </>
  )
}
