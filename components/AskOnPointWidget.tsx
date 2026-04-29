import Link from 'next/link'
import { MessageCircle } from 'lucide-react'

interface AskOnPointWidgetProps {
  isLoggedIn: boolean
}

export default function AskOnPointWidget({ isLoggedIn }: AskOnPointWidgetProps) {
  if (!isLoggedIn) return null

  return (
    <Link
      href="/chat"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-primary text-white text-sm font-semibold px-5 py-3 rounded-full shadow-lg hover:bg-primary/90 active:scale-95 transition-all duration-200"
    >
      <MessageCircle size={18} />
      Ask OnPoint
    </Link>
  )
}
