import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ShowcaseTalent() {
  return (
    <section className="bg-primary/[0.07] py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-16">
          {/* ── Left: Content ── */}
          <div className="flex-1 min-w-0">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-secondary leading-tight">Showcase Your Talent</h2>
            <p className="mt-4 text-foreground/70 text-base leading-relaxed max-w-md">
              Connect with businesses and organisations looking for young creative talent in the West Midlands. Create a
              profile and get discovered.
            </p>
            {/* Hidden for now until we have the talent page ready */}
            <Link
              href="/sign-up"
              className="invisible mt-8 inline-flex items-center gap-2 bg-primary text-white rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-primary/90 active:scale-95 transition-all duration-200"
            >
              Explore Talent Page
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* ── Right: Image ── */}
          <div className="flex-shrink-0 w-full md:w-[52%] lg:w-[50%]">
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="/images/ShowcaseYourTalent.jpeg"
                alt="Young creatives collaborating"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
