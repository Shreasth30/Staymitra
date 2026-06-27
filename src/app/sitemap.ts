import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { blogPosts } from "@/lib/blog-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://staymitra.in";

  const supabase = await createClient();
  const { data: properties } = await supabase
    .from("properties")
    .select("slug, updated_at")
    .eq("published", true)
    .order("updated_at", { ascending: false });

  const propertyUrls: MetadataRoute.Sitemap = (properties ?? []).map((p) => ({
    url: `${baseUrl}/stay/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // College-specific search pages for SEO
  const collegeSearchUrls: MetadataRoute.Sitemap = [
    "Galgotias",
    "NIET",
    "GL Bajaj",
    "GNIOT",
    "Sharda",
    "Bennett",
    "Greater Noida",
    "Knowledge Park",
  ].map((college) => ({
    url: `${baseUrl}/search?city=${encodeURIComponent(college)}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.85,
  }));

  // Blog post URLs
  const blogUrls: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...blogUrls,
    ...collegeSearchUrls,
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...propertyUrls,
  ];
}
