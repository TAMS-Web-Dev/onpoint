import { Quote } from 'lucide-react'

interface Story {
  name: string
  role: string
  quote: string
}

const STORIES: Story[] = [
  {
    name: 'James Chen',
    role: 'Tech Entrepreneur',
    quote:
      'The focus groups I\u2019ve participated in through On Point have given me valuable insights and connections for my startup.',
  },
  {
    name: 'Olivia Martinez',
    role: 'Web Developer',
    quote:
      'On Point\u2019s community has been instrumental in helping me develop my skills and build my professional network.',
  },
  {
    name: 'Maya Williams',
    role: 'Graphic Designer',
    quote:
      'On Point helped me find my first freelance gig and connect with like-minded creatives in Birmingham.',
  },
]

const AVATAR_COLORS = ['bg-primary', 'bg-secondary', 'bg-primary']

export default function SuccessStories() {
  return (
    <section className="bg-muted/40 py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">

        {/* ── Section Header ── */}
        <div className="text-center">
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="h-px w-12 bg-primary flex-shrink-0" />
            <span className="text-primary font-semibold text-sm tracking-widest uppercase">
              Community
            </span>
            <div className="h-px w-12 bg-primary flex-shrink-0" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-secondary">
            Community Success Stories
          </h2>
          <p className="mt-3 text-foreground/60 text-base max-w-xl mx-auto">
            See what our community members have accomplished through On Point.
          </p>
        </div>

        {/* ── Stories Grid ── */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {STORIES.map((story, index) => (
            <div
              key={story.name}
              className="bg-white rounded-2xl border border-border shadow-sm p-6 flex flex-col gap-5 transition-all duration-300 hover:shadow-md hover:border-primary/25"
            >
              {/* Quote icon */}
              <Quote size={28} className="text-primary flex-shrink-0" />

              {/* Quote text */}
              <p className="text-foreground/75 text-sm leading-relaxed italic flex-1">
                &ldquo;{story.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-base ${AVATAR_COLORS[index]}`}
                >
                  {story.name[0]}
                </div>
                <div>
                  <p className="text-secondary font-semibold text-sm leading-tight">
                    {story.name}
                  </p>
                  <p className="text-foreground/50 text-xs mt-0.5">
                    {story.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
