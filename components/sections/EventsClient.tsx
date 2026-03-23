'use client'

import { useMemo, useState } from 'react'
import {
  addMonths,
  endOfMonth,
  endOfWeek,
  isSameDay,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { Calendar, ChevronDown, MapPin, Search, SearchX, Tag } from 'lucide-react'
import EventCard from '@/components/shared/EventCard'
import type { PlaceholderEvent } from '@/lib/placeholder-data'

const CATEGORIES = ['All', 'Workshop', 'Networking', 'Focus Group', 'Education']

const LOCATION_OPTIONS = [
  { label: 'All Locations',  value: 'all'           },
  { label: 'Birmingham',     value: 'Birmingham'    },
  { label: 'Wolverhampton',  value: 'Wolverhampton' },
  { label: 'Walsall',        value: 'Walsall'       },
  { label: 'Dudley',         value: 'Dudley'        },
  { label: 'Online',         value: 'Online'        },
]

const DATE_OPTIONS = [
  { label: 'All Dates',   value: 'all'        },
  { label: 'Today',       value: 'today'      },
  { label: 'This Week',   value: 'this-week'  },
  { label: 'Next Month',  value: 'next-month' },
]

interface EventsClientProps {
  initialEvents: PlaceholderEvent[]
  isLoggedIn: boolean
}

export default function EventsClient({ initialEvents, isLoggedIn }: EventsClientProps) {
  const [query,          setQuery]          = useState('')
  const [category,       setCategory]       = useState('all')
  const [dateFilter,     setDateFilter]     = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')

  function resetFilters() {
    setQuery('')
    setCategory('all')
    setDateFilter('all')
    setLocationFilter('all')
  }

  const filteredEvents = useMemo(() => {
    const today = new Date()
    const q = query.toLowerCase()

    return initialEvents.filter((event) => {
      // Search
      if (q && !event.title.toLowerCase().includes(q) && !event.description.toLowerCase().includes(q)) {
        return false
      }

      // Category
      if (category !== 'all' && event.category !== category) {
        return false
      }

      // Location
      if (locationFilter !== 'all' && event.city !== locationFilter) {
        return false
      }

      // Date
      if (dateFilter !== 'all') {
        const d = parseISO(event.date)
        if (dateFilter === 'today' && !isSameDay(d, today)) return false
        if (dateFilter === 'this-week' &&
          !isWithinInterval(d, {
            start: startOfWeek(today, { weekStartsOn: 1 }),
            end:   endOfWeek(today,   { weekStartsOn: 1 }),
          })
        ) return false
        if (dateFilter === 'next-month' &&
          !isWithinInterval(d, {
            start: startOfMonth(addMonths(today, 1)),
            end:   endOfMonth(addMonths(today, 1)),
          })
        ) return false
      }

      return true
    })
  }, [initialEvents, query, category, dateFilter, locationFilter])

  return (
    <div className="mt-8">

      {/* ── Filter Bar ── */}
      <div className="flex flex-col sm:flex-row gap-3">

        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>

        {/* Date dropdown */}
        <div className="relative flex-shrink-0">
          <Calendar
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none"
          />
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none"
          />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="appearance-none w-full sm:w-44 pl-9 pr-8 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          >
            {DATE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Category dropdown */}
        <div className="relative flex-shrink-0">
          <Tag
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none"
          />
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="appearance-none w-full sm:w-48 pl-9 pr-8 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c === 'All' ? 'all' : c}>{c === 'All' ? 'All Categories' : c}</option>
            ))}
          </select>
        </div>

        {/* Location dropdown */}
        <div className="relative flex-shrink-0">
          <MapPin
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none"
          />
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none"
          />
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="appearance-none w-full sm:w-48 pl-9 pr-8 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          >
            {LOCATION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Results count ── */}
      <p className="mt-5 text-sm text-foreground/50">
        {filteredEvents.length === initialEvents.length
          ? `${initialEvents.length} events available`
          : `${filteredEvents.length} of ${initialEvents.length} events`}
      </p>

      {/* ── Grid or Empty State ── */}
      {filteredEvents.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} isLoggedIn={isLoggedIn} />
          ))}
        </div>
      ) : (
        <div className="mt-4 flex flex-col items-center justify-center py-24 text-center">
          <SearchX size={48} className="text-foreground/20 mb-4" />
          <h3 className="text-secondary font-semibold text-lg">
            No events found
          </h3>
          <p className="mt-1.5 text-foreground/50 text-sm max-w-xs">
            Try adjusting your search or filters to find what you&apos;re looking for.
          </p>
          <button
            onClick={resetFilters}
            className="mt-6 bg-primary text-white rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-primary/90 active:scale-95 transition-all duration-200"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  )
}
