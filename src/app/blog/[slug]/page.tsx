import { notFound } from "next/navigation";
import Link from "next/link";
import { blogPosts, getBlogPost, generateBlogMetadata } from "@/lib/blog-data";
import { ArrowLeft, ArrowRight, CalendarDays, Clock, Tag } from "lucide-react";
import type { Metadata } from "next";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Post not found" };
  return generateBlogMetadata(post);
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://staymitra.in";

  const currentIndex = blogPosts.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex > 0 ? blogPosts[currentIndex - 1] : null;
  const nextPost =
    currentIndex < blogPosts.length - 1 ? blogPosts[currentIndex + 1] : null;

  // JSON-LD Article schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Organization",
      name: "Staymitra",
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Staymitra",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/blog/${post.slug}`,
    },
    keywords: post.keywords.join(", "),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-8 sm:py-20">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to blog
        </Link>

        {/* Article Header */}
        <header className="mt-8 animate-fade-in-up">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary ring-1 ring-primary/20">
              <Tag className="h-3 w-3" />
              {post.category}
            </span>
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {new Date(post.date).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readTime}
            </span>
          </div>

          <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl leading-[1.15]">
            {post.title}
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-muted-foreground border-l-4 border-primary/30 pl-5">
            {post.description}
          </p>
        </header>

        {/* Divider */}
        <hr className="my-10 border-border" />

        {/* Article Content */}
        <div
          className="prose prose-lg dark:prose-invert max-w-none
            prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight
            prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:text-foreground
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-foreground
            prose-p:text-foreground/85 prose-p:leading-relaxed prose-p:mb-4
            prose-li:text-foreground/85 prose-li:leading-relaxed
            prose-strong:text-foreground prose-strong:font-bold
            prose-a:text-primary prose-a:font-semibold prose-a:underline prose-a:underline-offset-4 hover:prose-a:text-primary/80
            prose-table:border-border prose-th:text-foreground prose-th:bg-accent/50 prose-th:px-4 prose-th:py-2.5 prose-td:px-4 prose-td:py-2.5 prose-td:border-border
            prose-blockquote:border-primary/30 prose-blockquote:text-muted-foreground
            prose-hr:border-border
            animate-fade-in-up delay-100"
          dangerouslySetInnerHTML={{ __html: markdownToHtml(post.content) }}
        />

        {/* Keywords */}
        <div className="mt-12 flex flex-wrap gap-2">
          {post.keywords.map((kw) => (
            <span
              key={kw}
              className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              {kw}
            </span>
          ))}
        </div>

        {/* Divider */}
        <hr className="my-10 border-border" />

        {/* Prev / Next Navigation */}
        <div className="grid gap-4 sm:grid-cols-2">
          {prevPost ? (
            <Link
              href={`/blog/${prevPost.slug}`}
              className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                ← Previous
              </span>
              <p className="mt-2 font-display text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {prevPost.title}
              </p>
            </Link>
          ) : (
            <div />
          )}
          {nextPost ? (
            <Link
              href={`/blog/${nextPost.slug}`}
              className="group rounded-2xl border border-border bg-card p-5 text-right transition-all hover:border-primary/30 hover:shadow-md"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Next →
              </span>
              <p className="mt-2 font-display text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {nextPost.title}
              </p>
            </Link>
          ) : (
            <div />
          )}
        </div>

        {/* CTA */}
        <div className="mt-14 rounded-3xl border border-border bg-card/60 p-8 sm:p-12 text-center backdrop-blur-xl">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            Ready to find your hostel?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Browse verified hostels and PGs near your college — zero brokerage.
          </p>
          <Link
            href="/search"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl"
          >
            Explore stays
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </article>
    </>
  );
}

/**
 * Minimal markdown-to-HTML converter for blog content.
 * Handles headings, bold, italic, links, lists, tables, hr, blockquotes, and checkboxes.
 */
function markdownToHtml(md: string): string {
  const lines = md.split("\n");
  let html = "";
  let inList = false;
  let inTable = false;
  let tableHeaderDone = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trimEnd();

    // Skip empty lines
    if (line.trim() === "") {
      if (inList) {
        html += "</ul>\n";
        inList = false;
      }
      if (inTable) {
        html += "</tbody></table>\n";
        inTable = false;
        tableHeaderDone = false;
      }
      continue;
    }

    // HR
    if (/^---+$/.test(line.trim())) {
      if (inList) { html += "</ul>\n"; inList = false; }
      if (inTable) { html += "</tbody></table>\n"; inTable = false; tableHeaderDone = false; }
      html += "<hr />\n";
      continue;
    }

    // Table rows
    if (line.trim().startsWith("|")) {
      const cells = line
        .split("|")
        .filter((c) => c.trim() !== "")
        .map((c) => c.trim());

      // Skip separator row
      if (cells.every((c) => /^[-:]+$/.test(c))) {
        tableHeaderDone = true;
        continue;
      }

      if (!inTable) {
        html += '<table>\n<thead><tr>';
        cells.forEach((c) => {
          html += `<th>${inlineFormat(c)}</th>`;
        });
        html += "</tr></thead>\n<tbody>\n";
        inTable = true;
        continue;
      }

      html += "<tr>";
      cells.forEach((c) => {
        html += `<td>${inlineFormat(c)}</td>`;
      });
      html += "</tr>\n";
      continue;
    }

    // Close table if we hit a non-table line
    if (inTable && !line.trim().startsWith("|")) {
      html += "</tbody></table>\n";
      inTable = false;
      tableHeaderDone = false;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      if (inList) { html += "</ul>\n"; inList = false; }
      const level = headingMatch[1].length;
      html += `<h${level}>${inlineFormat(headingMatch[2])}</h${level}>\n`;
      continue;
    }

    // Blockquote
    if (line.trim().startsWith(">")) {
      if (inList) { html += "</ul>\n"; inList = false; }
      const content = line.replace(/^>\s*/, "").trim();
      // Skip alert syntax markers
      if (content.startsWith("[!")) continue;
      html += `<blockquote><p>${inlineFormat(content)}</p></blockquote>\n`;
      continue;
    }

    // Unordered list
    const listMatch = line.match(/^(\s*)[-*]\s+(.*)$/);
    if (listMatch) {
      if (!inList) {
        html += "<ul>\n";
        inList = true;
      }
      // Checkbox
      const checkContent = listMatch[2];
      if (checkContent.startsWith("[ ] ")) {
        html += `<li>☐ ${inlineFormat(checkContent.slice(4))}</li>\n`;
      } else if (checkContent.startsWith("[x] ") || checkContent.startsWith("[X] ")) {
        html += `<li>☑ ${inlineFormat(checkContent.slice(4))}</li>\n`;
      } else {
        html += `<li>${inlineFormat(checkContent)}</li>\n`;
      }
      continue;
    }

    // Numbered list
    const numListMatch = line.match(/^(\s*)\d+\.\s+(.*)$/);
    if (numListMatch) {
      if (!inList) {
        html += "<ul>\n";
        inList = true;
      }
      html += `<li>${inlineFormat(numListMatch[2])}</li>\n`;
      continue;
    }

    // Close list if not a list item
    if (inList) {
      html += "</ul>\n";
      inList = false;
    }

    // Paragraph
    html += `<p>${inlineFormat(line)}</p>\n`;
  }

  if (inList) html += "</ul>\n";
  if (inTable) html += "</tbody></table>\n";

  return html;
}

/** Inline formatting: bold, italic, links, code, emoji-style items */
function inlineFormat(text: string): string {
  // Links: [text](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  // Bold: **text**
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // Italic: *text*
  text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  // Inline code: `text`
  text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
  return text;
}
