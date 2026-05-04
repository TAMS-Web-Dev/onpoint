export interface EventbriteEvent {
  id: string
  title: string
  description: string
  date: string      // ISO local datetime from Eventbrite e.g. "2026-05-15T10:00:00"
  location: string  // full venue string for display
  city: string      // bare city name for location filter matching
  category: string  // Workshop | Networking | Focus Group | Education
  image: string     // absolute URL, may be empty string
  price: string     // "Free" | "£XX" | "Paid"
  url: string       // Eventbrite event page URL
}

function mapCategory(name: string | undefined): string {
  if (!name) return 'Workshop'
  const n = name.toLowerCase()
  if (n.includes('network') || n.includes('social') || n.includes('mixer') || n.includes('business')) return 'Networking'
  if (n.includes('focus') || n.includes('group') || n.includes('community')) return 'Focus Group'
  if (n.includes('educat') || n.includes('learn') || n.includes('train') || n.includes('school')) return 'Education'
  return 'Workshop'
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function fetchEvents(): Promise<EventbriteEvent[]> {
  const apiKey = process.env.EVENTBRITE_API_KEY
  const orgId  = process.env.EVENTBRITE_ORGANIZATION_ID

  if (!apiKey || !orgId) {
    console.warn('[Eventbrite] Missing EVENTBRITE_API_KEY or EVENTBRITE_ORGANIZATION_ID')
    return []
  }

  try {
    const res = await fetch(
      `https://www.eventbriteapi.com/v3/organizations/${orgId}/events/?status=live&expand=venue,category,logo`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        next: { revalidate: 3600 },
      }
    )

    if (!res.ok) {
      console.error(`[Eventbrite] API error: ${res.status} ${res.statusText}`)
      return []
    }

    const json = await res.json()
    const raw: any[] = json.events ?? []

    return raw.map((e: any): EventbriteEvent => ({
      id:          e.id,
      title:       e.name?.text ?? 'Untitled Event',
      description: e.summary ?? e.description?.text ?? '',
      date:        e.start?.local ?? new Date().toISOString(),
      location:
        e.venue?.address?.localized_address_display ??
        e.venue?.name ??
        'Online',
      city:     e.venue?.address?.city ?? 'Other',
      category: mapCategory(e.category?.name),
      image:    e.logo?.original?.url ?? e.logo?.url ?? '',
      price:    e.is_free
                  ? 'Free'
                  : e.ticket_availability?.minimum_ticket_price?.display ?? 'Paid',
      url:      e.url,
    }))
  } catch (err) {
    console.error('[Eventbrite] Fetch failed:', err)
    return []
  }
}
