'use client'

import { useRouter } from 'next/navigation'

interface EventDetailCTAProps {
  price: string
  isLoggedIn: boolean
  title: string
}

export default function EventDetailCTA({ price, isLoggedIn, title }: EventDetailCTAProps) {
  const router = useRouter()

  function handleBook() {
    if (!isLoggedIn) {
      router.push('/sign-up')
    } else {
      console.log('RSVP Clicked', { title })
    }
  }

  return (
    <>
      {/* ── Mobile sticky bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-white/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-foreground/50 font-medium">Price</p>
          <p className="text-lg font-extrabold text-secondary">{price}</p>
        </div>
        <button
          onClick={handleBook}
          className="flex-1 max-w-xs bg-primary hover:bg-primary/90 active:scale-95 text-white font-bold rounded-xl py-3 px-6 text-sm transition-all duration-200"
        >
          {isLoggedIn ? 'Book Now' : 'Sign Up to Book'}
        </button>
      </div>

      {/* ── Desktop inline card ── */}
      <div className="hidden md:block sticky top-24 rounded-2xl border border-border bg-white shadow-sm p-6">
        <div className="flex items-baseline gap-1 mb-1">
          <span className="text-2xl font-extrabold text-secondary">{price}</span>
        </div>
        <p className="text-sm text-foreground/50 mb-6">per person</p>
        <button
          onClick={handleBook}
          className="w-full bg-primary hover:bg-primary/90 active:scale-95 text-white font-bold rounded-xl py-3 px-4 text-sm transition-all duration-200"
        >
          {isLoggedIn ? 'Book Now' : 'Sign Up to Book'}
        </button>
        {!isLoggedIn && (
          <p className="mt-3 text-xs text-center text-foreground/40">
            Free to join. Takes 30 seconds.
          </p>
        )}
      </div>
    </>
  )
}
