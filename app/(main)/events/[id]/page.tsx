import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, CheckCircle2, MapPin, Clock, User } from "lucide-react";
import { format, parseISO } from "date-fns";
import { PLACEHOLDER_EVENTS } from "@/lib/placeholder-data";
import { getCurrentUserWithProfile } from "@/lib/db/profile";
import EventDetailCTA from "@/components/sections/EventDetailCTA";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;
  const event = PLACEHOLDER_EVENTS.find((e) => e.id === id);

  if (!event) {
    notFound();
  }

  const { user } = await getCurrentUserWithProfile();
  const isLoggedIn = !!user;

  const {
    title,
    category,
    date,
    time,
    location,
    city,
    image,
    price,
    detailedDescription,
    highlights,
    accessibilityInfo,
    host,
  } = event;

  const formattedDate = format(parseISO(date), "EEEE, d MMMM yyyy");
  const paragraphs = detailedDescription.split("\n\n");

  // Derive host initials for avatar
  const hostInitials = host.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="bg-background min-h-screen pb-24 md:pb-0">
      {/* ── Hero ── */}
      <div className="relative w-full md:max-w-7xl h-64 sm:h-80 md:h-96 overflow-hidden mx-auto md:rounded-2xl">
        <Image src={image} alt={title} fill priority sizes="100vw" className="object-cover" />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30" />

        {/* Back button */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white text-sm font-semibold px-3.5 py-2 rounded-full transition-all duration-200"
          >
            <ArrowLeft size={15} />
            Back to Events
          </Link>
        </div>

        {/* Category badge */}
        <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6">
          <span className="bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded-full">{category}</span>
        </div>
      </div>

      {/* ── Page body ── */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
          {/* ── Left / Main column ── */}
          <div className="md:col-span-2 space-y-10">
            {/* Title + meta */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-secondary leading-tight">{title}</h1>

              <div className="mt-5 space-y-2.5">
                <div className="flex items-center gap-2.5 text-sm text-foreground/70">
                  <Calendar size={16} className="text-primary flex-shrink-0" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-foreground/70">
                  <Clock size={16} className="text-primary flex-shrink-0" />
                  <span>{time}</span>
                </div>
                <div className="flex items-start gap-2.5 text-sm text-foreground/70">
                  <MapPin size={16} className="text-primary flex-shrink-0 mt-0.5" />
                  <span>
                    {location}
                    {city !== "Online" && <span className="ml-1 text-foreground/40">· {city}</span>}
                  </span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <hr className="border-border" />

            {/* About this event */}
            <section>
              <h2 className="text-xl font-extrabold text-secondary mb-4">About this event</h2>
              <div className="space-y-4">
                {paragraphs.map((para, i) => (
                  <p key={i} className="text-foreground/70 text-sm leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>

              {/* Highlights */}
              <ul className="mt-6 space-y-2">
                {highlights.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-foreground/80">
                    <CheckCircle2 size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Divider */}
            <hr className="border-border" />

            {/* Accessibility */}
            <section>
              <h2 className="text-xl font-extrabold text-secondary mb-4">Accessibility</h2>
              <div className="rounded-2xl border border-border bg-white p-5 space-y-2">
                {accessibilityInfo.map((item) => (
                  <div key={item} className="flex items-start gap-2.5 text-sm text-foreground/75">
                    <CheckCircle2 size={15} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Divider */}
            <hr className="border-border" />

            {/* Host */}
            <section>
              <h2 className="text-xl font-extrabold text-secondary mb-4">Your Host</h2>
              <div className="flex items-start gap-4 rounded-2xl border border-border bg-white p-5">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-extrabold text-sm">{hostInitials}</span>
                </div>
                <div>
                  <p className="font-bold text-secondary text-sm">{host.name}</p>
                  <p className="text-xs text-primary font-semibold mb-2">{host.role}</p>
                  <p className="text-sm text-foreground/65 leading-relaxed">{host.bio}</p>
                </div>
              </div>
            </section>

            {/* Divider */}
            <hr className="border-border" />

            {/* Map placeholder */}
            <section>
              <h2 className="text-xl font-extrabold text-secondary mb-4">Location</h2>
              {city === "Online" ? (
                <div className="rounded-2xl border border-border bg-white p-6 flex flex-col items-center justify-center gap-3 min-h-[160px] text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User size={22} className="text-primary" />
                  </div>
                  <p className="font-semibold text-secondary text-sm">This is an online event</p>
                  <p className="text-xs text-foreground/50 max-w-xs">
                    A Zoom link will be sent to your registered email 24 hours before the session starts.
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-border overflow-hidden">
                  {/* Styled map placeholder */}
                  <div className="relative bg-[#e8e4de] min-h-[220px] flex items-center justify-center">
                    {/* Grid lines to suggest a map */}
                    <div
                      className="absolute inset-0 opacity-30"
                      style={{
                        backgroundImage:
                          "linear-gradient(#c8bfb0 1px, transparent 1px), linear-gradient(90deg, #c8bfb0 1px, transparent 1px)",
                        backgroundSize: "36px 36px",
                      }}
                    />
                    {/* Roads */}
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full h-[3px] bg-white/70" />
                    </div>
                    <div className="absolute inset-0 flex justify-center">
                      <div className="h-full w-[3px] bg-white/70" />
                    </div>
                    {/* Pin */}
                    <div className="relative z-10 flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-primary shadow-lg flex items-center justify-center">
                        <MapPin size={18} className="text-white" />
                      </div>
                      <div className="bg-white rounded-lg px-3 py-1.5 shadow text-xs font-semibold text-secondary text-center max-w-[200px]">
                        {location}
                      </div>
                    </div>
                  </div>
                  <div className="bg-white px-4 py-3 flex items-center gap-2 text-sm text-foreground/60">
                    <MapPin size={14} className="text-primary flex-shrink-0" />
                    <span>{location}</span>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* ── Right / CTA column (desktop) ── */}
          <div className="md:col-span-1">
            <EventDetailCTA price={price} isLoggedIn={isLoggedIn} title={title} />
          </div>
        </div>
      </div>
    </main>
  );
}
