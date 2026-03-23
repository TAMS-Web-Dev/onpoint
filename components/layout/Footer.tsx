import Link from "next/link";
import { Instagram, Twitter, Facebook, Mail, Phone } from "lucide-react";

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Events", href: "/events" },
  { label: "More", href: "/more" },
  { label: "Sign Up", href: "/sign-up" },
];

const SOCIAL = [
  { icon: Instagram, label: "Instagram", href: "https://www.instagram.com/onpointwm/?hl=en" },
  { icon: Twitter, label: "X", href: "https://x.com/OnPointWM" },
  { icon: Facebook, label: "Facebook", href: "https://www.facebook.com/OnPointWM" },
];

export default function Footer() {
  return (
    <footer className="bg-[#2C2C2C] text-white">
      {/* ── CTA Banner ── */}
      <div className="border-b border-white/10 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">Ready to Join Our Community?</h2>
          <p className="mt-4 text-white/60 text-base max-w-lg mx-auto leading-relaxed">
            Take the first step towards connecting with other creative minds and discovering new opportunities.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 bg-primary text-white rounded-lg px-6 py-2.5 text-sm font-semibold hover:bg-primary/90 active:scale-95 transition-all duration-200"
            >
              Join Now
            </Link>
            <Link
              href="/more"
              className="inline-flex items-center gap-2 rounded-lg border border-white/40 text-white px-6 py-2.5 text-sm font-semibold hover:bg-white/10 active:scale-95 transition-all duration-200"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>

      {/* ── Footer Body ── */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-8 justify-between">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              {/* Orange OP badge */}
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-white font-extrabold text-xs tracking-tight">OP</span>
              </div>
              <span className="text-white font-bold text-lg">On Point</span>
            </div>
            <p className="text-white/55 text-sm leading-relaxed max-w-xs">
              Connecting young creatives in the West Midlands with opportunities, events, and each other.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-4 mt-6">
              {SOCIAL.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/50 hover:text-primary transition-colors duration-200"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-5 tracking-wide">Quick Links</h3>
            <ul className="space-y-3">
              {QUICK_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-white/55 text-sm hover:text-primary transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          {/* Hidden for now until we have these pages ready */}
          {/* 
          <div>
            <h3 className="text-white font-semibold text-sm mb-5 tracking-wide">Resources</h3>
            <ul className="space-y-3">
              {["Help Center", "Privacy Policy", "Terms of Service", "Feedback"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-white/55 text-sm hover:text-primary transition-colors duration-200">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          */}

          {/* Contact Us */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-5 tracking-wide">Contact Us</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:hello@onpoint.community"
                  className="flex items-center gap-2.5 text-white/55 text-sm hover:text-primary transition-colors duration-200 group"
                >
                  <Mail size={14} className="text-primary flex-shrink-0" />
                  hello@onpoint.community
                </a>
              </li>
              <li>
                <a
                  href="tel:+441234567890"
                  className="flex items-center gap-2.5 text-white/55 text-sm hover:text-primary transition-colors duration-200"
                >
                  <Phone size={14} className="text-primary flex-shrink-0" />
                  +44 123 456 7890
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-5 text-center">
          <p className="text-white/40 text-xs">© 2026 On Point. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
