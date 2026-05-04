import Hero from '@/components/sections/Hero'
import WhoWeAre from '@/components/sections/WhoWeAre'
import HowItWorks from '@/components/sections/HowItWorks'
import UpcomingEvents from '@/components/sections/UpcomingEvents'
import SuccessStories from '@/components/sections/SuccessStories'
import ShowcaseTalent from '@/components/sections/ShowcaseTalent'
import { getCurrentUserWithProfile } from '@/lib/db/profile'

export default async function HomePage() {
  const { user } = await getCurrentUserWithProfile()
  const isLoggedIn = !!user

  return (
    <main>
      <Hero isLoggedIn={isLoggedIn} />
      <WhoWeAre />
      <HowItWorks />
      <UpcomingEvents />
      <SuccessStories />
      <ShowcaseTalent />
    </main>
  )
}
