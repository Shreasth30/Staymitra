import Link from "next/link";
import { blogPosts } from "@/lib/blog-data";
import { ArrowRight, CalendarDays, Clock, Tag } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Student Hostel Tips & Guides for Greater Noida",
  description:
    "Read expert guides on finding the best hostels and PGs in Greater Noida. Tips for students near Galgotias, NIET, GL Bajaj, and more colleges.",
  keywords: [
    "Greater Noida hostel blog",
    "student accommodation tips",
    "hostel guide Greater Noida",
    "college hostel tips",
    "Galgotias hostel guide",
    "NIET hostel guide",
  ],
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogPage() {
  const featured = blogPosts[0];
  const rest = blogPosts.slice(1);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8 sm:py-20">
      {/* Header */}
      <div className="mx-auto max-w-3xl text-center animate-fade-in-up">
        <p className="text-sm font-bold uppercase tracking-wider text-primary">
          Staymitra Blog
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Student Hostel Tips &{" "}
          <span className="text-gradient">Guides</span>
        </h1>
        <p className="mt-5 text-lg text-muted-foreground">
          Everything you need to know about finding the perfect hostel or PG near
          your college in Greater Noida.
        </p>
      </div>

      {/* Featured Post */}
      <div className="mt-16 animate-fade-in-up delay-100">
        <Link
          href={`/blog/${featured.slug}`}
          className="group block overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:shadow-xl hover:border-primary/30"
        >
          <div className="grid lg:grid-cols-2">
            <div className="relative bg-gradient-to-br from-primary/10 via-amber-500/5 to-indigo-500/10 p-8 sm:p-12 flex items-center justify-center min-h-[240px]">
              <div className="text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary ring-1 ring-primary/20">
                  <Tag className="h-3 w-3" />
                  Featured
                </span>
                <p className="mt-4 font-display text-5xl font-bold text-foreground/10 sm:text-7xl">
                  01
                </p>
              </div>
            </div>
            <div className="p-8 sm:p-12 flex flex-col justify-center">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold">
                  {featured.category}
                </span>
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {new Date(featured.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {featured.readTime}
                </span>
              </div>
              <h2 className="mt-4 font-display text-2xl font-bold text-foreground group-hover:text-primary transition-colors sm:text-3xl">
                {featured.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                {featured.description}
              </p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-primary">
                Read article
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Post Grid */}
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-2 animate-fade-in-up delay-200">
        {rest.map((post, i) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/30"
          >
            {/* Decorative header */}
            <div className="relative bg-gradient-to-br from-primary/5 via-transparent to-amber-500/5 p-6 sm:p-8">
              <p className="font-display text-4xl font-bold text-foreground/8 sm:text-5xl">
                {String(i + 2).padStart(2, "0")}
              </p>
              <span className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                {post.category}
              </span>
            </div>

            <div className="flex flex-1 flex-col p-6 sm:p-8 pt-0 sm:pt-0 -mt-2">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  {new Date(post.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {post.readTime}
                </span>
              </div>
              <h2 className="mt-3 font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors sm:text-xl">
                {post.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3 flex-1">
                {post.description}
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-primary">
                Read article
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-20 text-center animate-fade-in-up delay-300">
        <div className="rounded-3xl border border-border bg-card/60 p-10 sm:p-14 backdrop-blur-xl">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            Ready to find your hostel?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Browse verified hostels and PGs near your college with zero
            brokerage.
          </p>
          <Link
            href="/search"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl"
          >
            Explore stays
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
