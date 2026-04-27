import Image from "next/image";
import Link from "next/link";
import { ThumbsUp, MessageCircle, Share2 } from "lucide-react";

const POSTS = [
  {
    id: 1,
    author: "Alex Johnson",
    time: "5 days ago",
    content:
      "Welcome to On Point! We're excited to launch our new community platform for creative young adults in the West Midlands. Join us on this journey as we build a vibrant community together!",
    image: "/images/community/post1.jpeg",
    likes: 24,
    comments: 0,
  },
  {
    id: 2,
    author: "Alex Johnson",
    time: "3 days ago",
    title: "Upcoming Creative Opportunities",
    content:
      "We've partnered with several local businesses looking for fresh talent. Check out our Talent page for more information on these exciting opportunities!",
    image: "/images/community/post2.jpeg",
    likes: 8,
    comments: 3,
  },
];

function PostCard({ post }: { post: (typeof POSTS)[number] }) {
  return (
    <article className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="p-5">
        {/* Author row */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-border">
            <Image src="/images/community/avatar.jpeg" alt={post.author} fill sizes="40px" className="object-cover" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-secondary">{post.author}</span>
            <span className="bg-secondary/10 text-secondary text-xs font-semibold px-2 py-0.5 rounded-full">Admin</span>
            <span className="text-xs text-muted-foreground">{post.time}</span>
          </div>
        </div>

        {/* Optional title */}
        {post.title && <h2 className="text-base font-bold text-secondary mb-2">{post.title}</h2>}

        {/* Body */}
        <p className="text-sm text-foreground/80 leading-relaxed">{post.content}</p>
      </div>

      {/* Post image */}
      <div className="relative aspect-[16/9] mx-5 mb-5 rounded-xl overflow-hidden">
        <Image src={post.image} alt="" fill sizes="(max-width: 768px) 100vw, 600px" className="object-cover" />
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-5 px-5 pb-4 border-t border-border pt-3">
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <ThumbsUp size={15} />
          {post.likes}
        </span>
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MessageCircle size={15} />
          {post.comments}
        </span>
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Share2 size={15} />
          Share
        </span>
      </div>
    </article>
  );
}

export default function CommunityPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-secondary">Community</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect with creatives and stay updated with the latest news.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Left — posts */}
        <div className="flex flex-col gap-6">
          {POSTS.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {/* Right — sidebar */}
        <aside className="lg:sticky lg:top-20">
          <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
            <h2 className="text-base font-bold text-secondary">Ask OnPoint</h2>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
              Have a question or need support? Our AI assistant is here to help.
            </p>
            <Link
              href="/chat"
              className="mt-4 flex items-center justify-center w-full bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors"
            >
              Chat with Ask OnPoint
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
