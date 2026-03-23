import Link from 'next/link'
import { PLACEHOLDER_EVENTS } from '@/lib/placeholder-data'
import EventCard from '@/components/shared/EventCard'

interface UpcomingEventsProps {
  isLoggedIn: boolean
}

export default function UpcomingEvents({ isLoggedIn }: UpcomingEventsProps) {
  // Future Supabase swap: replace this line only
  // const { data: events } = await supabase.from('events').select('*').limit(4)
  const events = PLACEHOLDER_EVENTS

  return (
    <section className="bg-background py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">

        {/* ── Section Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-12 bg-primary flex-shrink-0" />
              <span className="text-primary font-semibold text-sm tracking-widest uppercase">
                What&apos;s On
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-secondary">
              Upcoming Events
            </h2>
          </div>

          <Link
            href="/events"
            className="inline-flex items-center justify-center rounded-lg border border-primary text-primary bg-background px-3 py-1.5 text-sm font-medium hover:bg-primary hover:text-white transition-colors flex-shrink-0"
          >
            View All Events
          </Link>
        </div>

        {/* ── Events Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} isLoggedIn={isLoggedIn} />
          ))}
        </div>

      </div>
    </section>
  )
}
