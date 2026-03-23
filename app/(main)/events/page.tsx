import EventsClient from '@/components/sections/EventsClient'
import { PLACEHOLDER_EVENTS } from '@/lib/placeholder-data'
import { getCurrentUserWithProfile } from '@/lib/db/profile'

export default async function EventsPage() {
  // Future Supabase swap: replace this line only
  // const events = await supabase.from('events').select('*')
  const events = PLACEHOLDER_EVENTS

  const { user } = await getCurrentUserWithProfile()
  const isLoggedIn = !!user

  return (
    <main className="bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-12 pb-20">

        {/* ── Page Header ── */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-secondary">
          Discover Events
        </h1>
        <p className="mt-2 text-foreground/60 text-base">
          Find creative events and focus groups in the West Midlands.
        </p>

        {/* ── Interactive Filter + Grid ── */}
        <EventsClient initialEvents={events} isLoggedIn={isLoggedIn} />

      </div>
    </main>
  )
}
