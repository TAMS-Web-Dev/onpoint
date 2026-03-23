import Image from 'next/image'
import { CheckCircle2 } from 'lucide-react'

const LOOKING_FOR = [
  'Ideas that work!',
  'Fresh looks on old problems',
  'Problem solvers',
  'Real-talk',
]

export default function WhoWeAre() {
  return (
    <section className="bg-background py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">

          {/* ── Left Column — Content ── */}
          <div className="flex-1 min-w-0">

            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-12 bg-primary flex-shrink-0" />
              <span className="text-primary font-semibold text-sm tracking-widest uppercase">
                Who We Are
              </span>
            </div>

            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl font-extrabold text-secondary leading-tight">
              An independent space<br className="hidden sm:block" />
              run by young people.
            </h2>

            {/* Body */}
            <p className="mt-5 text-foreground/75 text-base leading-relaxed max-w-lg">
              OnPoint is an independent space run by teens &amp; young people.
              We&apos;re speaking up for our communities about key people,
              policies, projects, funding or ideas helping to keep our
              communities safer. On Point is a positive ideas platform — a space
              to empower young people to share points of view on important issues
              with solutions. Important doesn&apos;t have to mean boring!
            </p>

            {/* Divider */}
            <div className="mt-8 h-px bg-border" />

            {/* We're looking for */}
            <p className="mt-6 mb-4 font-semibold text-secondary">
              We&apos;re looking for:
            </p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {LOOKING_FOR.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 bg-primary/[0.08] rounded-xl px-4 py-3"
                >
                  <CheckCircle2
                    size={18}
                    className="text-primary flex-shrink-0"
                  />
                  <span className="text-secondary font-semibold text-sm">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Right Column — Decorative Image ── */}
          <div className="relative flex-shrink-0 w-full lg:w-[42%] flex justify-center lg:justify-end">

            {/* Orange accent block — top-left */}
            <div className="hidden lg:block absolute -top-5 -left-5 w-28 h-36 bg-primary rounded-2xl z-0" />

            {/* Purple accent block — bottom-right */}
            <div className="hidden lg:block absolute -bottom-5 -right-5 w-16 h-16 bg-secondary rounded-2xl opacity-80 z-0" />

            {/* Image */}
            <div className="relative z-10 w-full max-w-xs sm:max-w-sm lg:max-w-none lg:w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/5">
              <Image
                src="/images/WeAreOnPoint-745x1024.jpg"
                alt="OnPoint young creatives"
                fill
                sizes="(max-width: 1024px) 80vw, 42vw"
                className="object-cover object-top"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
