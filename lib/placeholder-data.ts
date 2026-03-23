export interface PlaceholderEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string; // ISO 8601
  time: string; // e.g. "10:00 – 13:00"
  city: string; // "Birmingham" | "Wolverhampton" | "Walsall" | "Dudley" | "Online"
  location: string; // full venue address shown on the card
  image: string; // path relative to /public
  price: string; // "Free" | "£XX"
  detailedDescription: string;
  highlights: string[];
  accessibilityInfo: string[];
  host: {
    name: string;
    role: string;
    bio: string;
  };
}

export const PLACEHOLDER_EVENTS: PlaceholderEvent[] = [
  {
    id: "1",
    title: "Photography Workshop",
    description: "Learn the basics of portrait photography in this hands-on workshop.",
    category: "Workshop",
    date: "2026-03-26",
    time: "10:00 – 13:00",
    city: "Birmingham",
    location: "Birmingham Creative Hub, 23 Station Street",
    image: "/images/events/Young-People.jpg",
    price: "Free",
    detailedDescription:
      "Whether you've just picked up your first camera or you've been shooting on your phone for years, this workshop will give you the skills to take stunning portraits. We'll cover the fundamentals of lighting, composition, and posing in a relaxed, creative environment.\n\nYou'll shoot alongside other young creatives and get real-time feedback from our host photographer. All equipment is provided on the day — just bring yourself and your enthusiasm. Free pizza and refreshments will be available throughout the session.\n\nSpaces are strictly limited to 12 participants so everyone gets hands-on time. Materials, printed handouts, and a follow-up resource pack are all included at no cost.",
    highlights: [
      "Free entry — no experience needed",
      "All camera equipment provided",
      "Free pizza and refreshments",
      "Printed resource pack to take home",
      "Limited to 12 participants for personalised feedback",
    ],
    accessibilityInfo: [
      "Wheelchair accessible venue",
      "Step-free access throughout",
      "Hearing loop available at reception",
      "Large-print materials available on request",
    ],
    host: {
      name: "Marcus Reid",
      role: "Portrait Photographer & Educator",
      bio: "Marcus has been shooting commercial and editorial portraits for over a decade. He's passionate about making photography accessible to young people and has run free workshops across the West Midlands since 2019.",
    },
  },
  {
    id: "2",
    title: "Creative Networking Mixer",
    description: "Meet other creatives in the West Midlands and expand your professional network.",
    category: "Networking",
    date: "2026-04-02",
    time: "18:00 – 21:00",
    city: "Wolverhampton",
    location: "The Light House, Chubb Buildings, Fryer Street, Wolverhampton",
    image: "/images/events/About-OnPoint.jpg",
    price: "Free",
    detailedDescription:
      "This is your chance to meet designers, musicians, writers, filmmakers, and entrepreneurs from across the West Midlands in one room. The Creative Networking Mixer is a relaxed, open evening — no name badges, no awkward icebreakers, just good conversation.\n\nWe'll have a short five-minute lightning talk from a local creative professional to kick things off, then the rest of the evening is yours to explore. Complimentary drinks and snacks are provided throughout.\n\nWhether you're looking for collaborators, mentors, or just people who get what you're trying to do, this is the place to start.",
    highlights: [
      "Free entry",
      "Complimentary drinks and snacks provided",
      "Lightning talk from a local creative pro",
      "Open to all creative disciplines",
      "Casual, pressure-free atmosphere",
    ],
    accessibilityInfo: [
      "Wheelchair accessible entrance on Fryer Street",
      "Accessible toilets on the ground floor",
      "Quiet breakout area available",
    ],
    host: {
      name: "Priya Nair",
      role: "Community Lead, OnPoint WM",
      bio: "Priya has been connecting creatives across Birmingham and the Black Country for three years. She believes every young person in the region deserves access to a network that champions their work.",
    },
  },
  {
    id: "3",
    title: "Digital Marketing Focus Group",
    description: "Help shape the future of digital marketing strategies for local businesses.",
    category: "Focus Group",
    date: "2026-03-22",
    time: "14:00 – 16:00",
    city: "Online",
    location: "Online — Zoom link sent on registration",
    image: "/images/events/OnPoint-Research.jpg",
    price: "Free",
    detailedDescription:
      "We're partnering with a collective of West Midlands small businesses to understand how young people discover, engage with, and respond to digital marketing. Your opinions will directly influence real campaigns.\n\nThis is a relaxed, facilitated conversation via Zoom — there are no right or wrong answers, just honest thoughts. The session runs for two hours with a short break in the middle.\n\nAll participants will receive a £10 Amazon voucher as a thank-you for their time. A Zoom link and joining instructions will be sent to your registered email 24 hours before the session.",
    highlights: [
      "Free to attend",
      "£10 Amazon voucher for all participants",
      "Hosted on Zoom — join from anywhere",
      "Relaxed, facilitated discussion format",
      "Your views shape real marketing campaigns",
    ],
    accessibilityInfo: [
      "Fully online — accessible from home",
      "Live captions enabled on Zoom",
      "Session recording available on request for review",
      "BSL interpreter available — request at registration",
    ],
    host: {
      name: "Jess Okoye",
      role: "UX Researcher & Facilitator",
      bio: "Jess specialises in participatory research with young people. She has facilitated over 50 focus groups for charities, councils, and brands who want to genuinely listen to the communities they serve.",
    },
  },
  {
    id: "4",
    title: "Web Development Bootcamp",
    description: "Intensive one-day bootcamp covering HTML, CSS and JavaScript basics.",
    category: "Education",
    date: "2026-03-29",
    time: "09:30 – 17:00",
    city: "Birmingham",
    location: "Tech Hub, 45 Corporation Street, Birmingham",
    image: "/images/events/computer-photo-92904.jpeg",
    price: "Free",
    detailedDescription:
      "This full-day bootcamp is designed for absolute beginners who want to understand how websites are built. Starting from scratch, you'll learn the core building blocks of the web — HTML structure, CSS styling, and JavaScript interactivity — and finish the day having built your very own webpage from the ground up.\n\nThe day is split into three focused sessions with breaks in between. Lunch is provided. You'll be working on a laptop supplied by the venue, so you don't need to bring any equipment — just a willingness to learn.\n\nBy the end of the day you'll have a working project to show friends and family, a certificate of completion, and a clear roadmap for continuing your learning journey.",
    highlights: [
      "Free entry — no prior experience required",
      "Laptops provided — bring nothing but yourself",
      "Lunch and refreshments included",
      "Certificate of completion",
      "Build a real webpage by the end of the day",
    ],
    accessibilityInfo: [
      "Wheelchair accessible building",
      "Lift access to all floors",
      "Accessible workstations available on request",
      "Quiet working environment throughout",
    ],
    host: {
      name: "Tobi Adeyemi",
      role: "Full-Stack Developer & Coding Educator",
      bio: "Tobi has been teaching web development to career-changers and young people for six years. He's a firm believer that coding is a skill anyone can learn with the right guidance — and he's on a mission to prove it.",
    },
  },
];
