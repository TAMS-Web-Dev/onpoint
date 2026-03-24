import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Hero() {
  return (
    <section className="relative bg-primary overflow-hidden min-h-[calc(100vh-3.5rem)]">
      {/* Subtle radial depth overlay on far left */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-1/3"
        style={{
          background: "radial-gradient(ellipse at left center, rgba(0,0,0,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 lg:px-8 h-full min-h-[calc(100vh-3.5rem)] flex flex-col md:flex-row items-center gap-10 py-16 md:py-0">
        {/* ── Left Column ── */}
        <div className="flex-1 flex flex-col justify-center md:pr-8 z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
            Your stories.
            <br />
            Your points of view.
          </h1>

          <p className="mt-5 text-white/85 text-base sm:text-lg font-medium max-w-md leading-relaxed">
            OnPoint is the youth-led platform for West Midlands creatives. Share your voice, discover opportunities, and
            connect with a community that gets it.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {/* Join Us — white filled, secondary text (prototype bug fix) */}
            <Link
              href="/sign-up"
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold",
                "bg-white text-secondary",
                "shadow-md hover:bg-white/90 active:scale-95 transition-all duration-200",
              )}
            >
              Join Us
            </Link>

            {/* Explore Events — white outline */}
            <Link
              href="/events"
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold",
                "border-2 border-white text-white",
                "hover:bg-white hover:text-secondary active:scale-95 transition-all duration-200",
              )}
            >
              Explore Events
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* ── Right Column ── */}
        <div className="flex-shrink-0 w-full md:w-[42%] lg:w-[40%] flex justify-center md:justify-end relative py-8 md:py-12">
          {/* Decorative depth block — offset behind the image */}
          <div
            className="absolute top-4 right-0 w-[88%] h-[92%] rounded-2xl"
            style={{ background: "rgba(0,0,0,0.15)" }}
          />

          {/* Image card */}
          <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-none md:w-[88%] aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/20">
            <Image
              src="/images/WeAreOnPoint-745x1024.jpg"
              alt="OnPoint young creatives"
              fill
              sizes="(max-width: 768px) 80vw, 40vw"
              className="object-cover object-center"
              priority
            />
          </div>

          {/* Social proof chip */}
          <div className="absolute bottom-10 right-4 bg-white rounded-xl px-4 py-3 shadow-xl max-w-[210px]">
            <p className="text-primary text-sm font-bold leading-tight">Join 500+ young people</p>
            <p className="text-secondary text-xs font-medium mt-0.5">in Your Area</p>
          </div>
        </div>
      </div>
    </section>
  );
}
