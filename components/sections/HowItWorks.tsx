import { Fragment } from 'react'
import { ArrowRight, Compass, UserPlus, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Step {
  number: number
  icon: LucideIcon
  title: string
  body: string
}

const STEPS: Step[] = [
  {
    number: 1,
    icon: UserPlus,
    title: 'Create Your Profile',
    body: 'Sign up and build your creative profile to showcase your talents and interests.',
  },
  {
    number: 2,
    icon: Compass,
    title: 'Discover Opportunities',
    body: 'Browse events, focus groups, and job opportunities tailored to your interests.',
  },
  {
    number: 3,
    icon: Users,
    title: 'Connect & Grow',
    body: 'Engage with the community, attend events, and develop your skills and network.',
  },
]

export default function HowItWorks() {
  return (
    <section className="bg-muted/40 py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">

        {/* ── Section Header ── */}
        <div className="text-center mb-16">
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="h-px w-12 bg-primary flex-shrink-0" />
            <span className="text-primary font-semibold text-sm tracking-widest uppercase">
              Get Started
            </span>
            <div className="h-px w-12 bg-primary flex-shrink-0" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-secondary">
            How It Works
          </h2>
          <p className="mt-3 text-foreground/60 text-base max-w-md mx-auto">
            Three simple steps to join the OnPoint community.
          </p>
        </div>

        {/* ── Steps Row ── */}
        <div className="flex flex-col md:flex-row items-stretch gap-4 md:gap-0">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            return (
              <Fragment key={step.number}>
                {/* Step Card */}
                <div
                  className="group relative flex-1 bg-white rounded-2xl p-8 shadow-sm border border-border overflow-hidden cursor-default transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-primary/40"
                >
                  {/* Number circle */}
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-extrabold text-xl">
                      {step.number}
                    </span>
                  </div>

                  {/* Icon */}
                  <Icon
                    size={22}
                    className="text-primary/50 mt-4 mb-3"
                  />

                  {/* Title */}
                  <h3 className="text-secondary font-semibold text-lg">
                    {step.title}
                  </h3>

                  {/* Body */}
                  <p className="mt-2 text-foreground/65 text-sm leading-relaxed">
                    {step.body}
                  </p>

                  {/* Animated bottom accent bar */}
                  <div className="absolute bottom-0 left-8 right-8 h-[3px] bg-primary rounded-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </div>

                {/* Arrow connector (desktop only, not after last step) */}
                {index < STEPS.length - 1 && (
                  <div className="hidden md:flex items-center justify-center px-2 mt-14 flex-shrink-0 text-primary/35">
                    <ArrowRight size={20} />
                  </div>
                )}
              </Fragment>
            )
          })}
        </div>

      </div>
    </section>
  )
}
