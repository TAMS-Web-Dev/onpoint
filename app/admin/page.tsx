import Link from 'next/link'
import { BarChart2, Flag, Users, MessageSquare, ShieldPlus, Handshake, ArrowRight } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { createClient as serviceClient } from '@supabase/supabase-js'

interface DashboardCard {
  href: string
  icon: React.ElementType
  iconBg: string
  iconColor: string
  title: string
  description: string
  badge?: number
}

const BASE_CARDS: DashboardCard[] = [
  {
    href: '/admin/usage',
    icon: BarChart2,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    title: 'Usage',
    description: 'AI chat volumes, active users, and feature engagement metrics.',
  },
  {
    href: '/admin/flags',
    icon: Flag,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-500',
    title: 'Flagged Content',
    description: 'Review messages that triggered safety or moderation alerts.',
  },
  {
    href: '/admin/users',
    icon: Users,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    title: 'User Management',
    description: 'View, search, and manage registered youth portal accounts.',
  },
  {
    href: '/admin/logs',
    icon: MessageSquare,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    title: 'Chat Logs',
    description: 'Browse full conversation histories for audit and support.',
  },
]

const SUPER_ADMIN_CARDS: DashboardCard[] = [
  {
    href: '/admin/admin-management',
    icon: ShieldPlus,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    title: 'Admin Management',
    description: 'Add or remove admin accounts. Restricted to super admins only.',
  },
]

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const role = user?.app_metadata?.role ?? user?.user_metadata?.role
  const isSuperAdmin = role === 'super_admin'

  // Pending partner count for badge
  const { count: pendingCount } = await serviceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('user_type', 'partner')
    .eq('status', 'pending')

  const partnerCard: DashboardCard = {
    href: '/admin/partner-requests',
    icon: Handshake,
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-600',
    title: 'Partner Requests',
    description: 'Review and approve partner organisation registrations.',
    badge: pendingCount ?? 0,
  }

  const cards: DashboardCard[] = [
    ...BASE_CARDS,
    partnerCard,
    ...(isSuperAdmin ? SUPER_ADMIN_CARDS : []),
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-[#2D1D44]">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select a section to manage the OnPoint platform.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map(({ href, icon: Icon, iconBg, iconColor, title, description, badge }) => (
          <Link key={href} href={href} className="group/card-link outline-none">
            <Card className="h-full hover:ring-[#FF790E]/40 hover:shadow-md transition-all duration-200 cursor-pointer">
              <CardContent className="pt-4 pb-0">
                <div className={`${iconBg} rounded-xl p-3 w-fit`}>
                  <Icon size={22} className={iconColor} />
                </div>
              </CardContent>
              <CardHeader>
                <CardTitle className="text-[#2D1D44] font-semibold text-base flex items-center gap-2">
                  {title}
                  {badge != null && badge > 0 && (
                    <span className="inline-flex items-center rounded-full bg-yellow-100 border border-yellow-300 text-yellow-800 text-xs font-bold px-2 py-0.5">
                      {badge}
                    </span>
                  )}
                </CardTitle>
                <CardDescription className="leading-relaxed">
                  {description}
                </CardDescription>
                <CardAction>
                  <ArrowRight
                    size={16}
                    className="text-muted-foreground/40 group-hover/card-link:text-[#FF790E] group-hover/card-link:translate-x-0.5 transition-all duration-200 mt-1"
                  />
                </CardAction>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
