'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Calendar, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'
import type { PlaceholderEvent } from '@/lib/placeholder-data'

interface EventCardProps {
  event: PlaceholderEvent
  isLoggedIn: boolean
}

export default function EventCard({ event, isLoggedIn }: EventCardProps) {
  const router = useRouter()
  const { id, title, description, category, date, location, image, price } = event

  function handleBook() {
    if (!isLoggedIn) {
      router.push('/sign-up')
    } else {
      toast.success('Booking Successful!', {
        description: "We've reserved your spot. See you there!",
      })
    }
  }

  return (
    <article className="group flex flex-col h-full bg-white rounded-2xl border border-border shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30">

      {/* Image — links to detail page */}
      <Link href={`/events/${id}`} className="relative aspect-[16/10] overflow-hidden flex-shrink-0 block">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Category badge */}
        <span className="absolute top-3 right-3 bg-primary text-white text-xs font-semibold px-2.5 py-1 rounded-full">
          {category}
        </span>
      </Link>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5">
        <Link href={`/events/${id}`} className="hover:text-primary transition-colors">
          <h3 className="text-secondary font-extrabold text-base leading-snug">
            {title}
          </h3>
        </Link>
        <p className="mt-1.5 text-foreground/65 text-sm leading-relaxed line-clamp-2">
          {description}
        </p>

        {/* Meta */}
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-foreground/55">
            <Calendar size={13} className="text-primary flex-shrink-0" />
            <span>{format(parseISO(date), 'MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-foreground/55">
            <MapPin size={13} className="text-primary flex-shrink-0" />
            <span className="line-clamp-1">{location}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="text-secondary font-extrabold text-sm">{price}</span>
          <button
            onClick={handleBook}
            className="bg-primary text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-primary/90 active:scale-95 transition-all duration-200"
          >
            Book Now
          </button>
        </div>
      </div>
    </article>
  )
}
