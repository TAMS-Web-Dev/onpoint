import Image from 'next/image'
import { Calendar, MapPin } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import type { EventbriteEvent } from '@/lib/eventbrite'

interface EventCardProps {
  event: EventbriteEvent
}

export default function EventCard({ event }: EventCardProps) {
  const { title, description, category, date, location, image, price, url } = event

  return (
    <article className="group flex flex-col h-full bg-white rounded-2xl border border-border shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30">

      {/* Image */}
      {image ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="relative aspect-[16/10] overflow-hidden flex-shrink-0 block">
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
        </a>
      ) : (
        <div className="relative aspect-[16/10] flex-shrink-0 bg-primary/10 flex items-center justify-center">
          <span className="bg-primary text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            {category}
          </span>
        </div>
      )}

      {/* Body */}
      <div className="flex flex-col flex-1 p-5">
        <a href={url} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
          <h3 className="text-secondary font-extrabold text-base leading-snug">
            {title}
          </h3>
        </a>
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
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5 active:scale-95 transition-all duration-200"
          >
            More Details
          </a>
        </div>
      </div>
    </article>
  )
}
