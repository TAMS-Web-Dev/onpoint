import Link from "next/link";
import Image from "next/image";
import { getCurrentUserWithProfile } from "@/lib/db/profile";
import { MorePageClient } from "@/components/more/MorePageClient";

export default async function MorePage() {
  const { user, profile } = await getCurrentUserWithProfile();
  const isLoggedIn = !!user && !!profile;

  return (
    <main className="bg-muted/50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-12 pb-20">

        {/* ── Page Header ── */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-secondary">More Options</h1>
        <p className="mt-2 text-foreground/60 text-base">
          Access account settings, support, and more.
        </p>

        {/* ── Guest State ── */}
        {!isLoggedIn && (
          <div className="mt-8 bg-secondary rounded-2xl p-8 text-center">
            <Image
              src="/assets/onpoint-logo-icon-orange-with-white-type.png"
              alt="OnPoint"
              width={56}
              height={56}
              className="mx-auto"
            />
            <h2 className="mt-4 text-white font-extrabold text-2xl">Welcome to OnPoint</h2>
            <p className="mt-2 text-white/70 mx-auto leading-relaxed">
              Sign in to access your profile, manage settings, and connect with the community.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center rounded-lg bg-white text-secondary px-6 py-2.5 text-sm font-semibold hover:bg-white/90 active:scale-95 transition-all duration-200"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-lg bg-primary text-white px-6 py-2.5 text-sm font-semibold hover:bg-primary/90 active:scale-95 transition-all duration-200"
              >
                Create Account
              </Link>
            </div>
          </div>
        )}

        {/* ── Authenticated State (React Query powered) ── */}
        {isLoggedIn && (
          <MorePageClient
            initialProfile={profile}
            userId={user.id}
            userEmail={user.email}
          />
        )}

      </div>
    </main>
  );
}
