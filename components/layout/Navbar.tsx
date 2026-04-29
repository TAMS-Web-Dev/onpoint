"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Calendar, Home, Menu, MoreHorizontal, User, Users, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Events", href: "/events", icon: Calendar },
  { label: "Community", href: "/community", icon: Users },
];

interface NavbarProps {
  initials: string | null;
}

export default function Navbar({ initials }: NavbarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const visibleLinks = initials ? NAV_LINKS.filter((l) => l.href !== '/') : NAV_LINKS;

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <nav className="max-w-7xl mx-auto h-14 flex items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link href="/" onClick={() => setOpen(false)}>
          <Image
            src="/assets/onpoint-logo-icon-orange-with-white-type.png"
            alt="OnPoint"
            width={40}
            height={40}
            priority
          />
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden md:flex items-center gap-1">
          {visibleLinks.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-4 text-sm font-medium border-b-2 transition-colors",
                    active ? "text-primary border-primary" : "text-foreground border-transparent hover:text-primary",
                  )}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {initials ? (
            <Link
              href="/more"
              aria-label="Your account"
              className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs hover:bg-primary/90 transition-colors flex-shrink-0"
            >
              {initials}
            </Link>
          ) : (
            <Link
              href="/sign-in"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "border-primary text-primary hover:bg-primary hover:text-primary-foreground",
              )}
            >
              <User size={15} />
              Sign In
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-1.5 rounded-md text-foreground hover:bg-muted transition-colors"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden border-t border-border bg-background px-4 py-2">
          <ul className="flex flex-col">
            {visibleLinks.map(({ label, href, icon: Icon }) => {
              const active = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2 px-2 py-3 text-sm font-medium border-l-2 transition-colors",
                      active ? "text-primary border-primary" : "text-foreground border-transparent hover:text-primary",
                    )}
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </header>
  );
}
