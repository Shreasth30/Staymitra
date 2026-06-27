import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HeaderWrapper, FooterWrapper } from "@/components/layout-wrappers";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: {
    default: "Staymitra — Best Hostels & PGs in Greater Noida | Near Galgotias, NIET, GL Bajaj",
    template: "%s | Staymitra — Hostels & PGs in Greater Noida",
  },
  description:
    "Find the best hostels and PG accommodations in Greater Noida near Galgotias University, NIET, GL Bajaj, GNIOT & more. Zero brokerage, verified listings, direct owner contact. Compare rooms, schedule visits, and move in hassle-free.",
  keywords: [
    "hostels in Greater Noida",
    "PG in Greater Noida",
    "hostel near Galgotias University",
    "hostel near NIET Greater Noida",
    "hostel near GL Bajaj",
    "hostel near GNIOT",
    "hostel near my college Greater Noida",
    "boys hostel Greater Noida",
    "girls hostel Greater Noida",
    "paying guest Greater Noida",
    "affordable hostel Greater Noida",
    "student accommodation Greater Noida",
    "hostel Knowledge Park",
    "PG near Galgotias",
    "best hostels near colleges Greater Noida",
    "hostel with food Greater Noida",
    "AC hostel Greater Noida",
    "co-living Greater Noida",
    "zero brokerage hostel",
    "Staymitra",
  ],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://staymitra.in",
  ),
  alternates: {
    canonical: "/",
    languages: { "en-IN": "/" },
  },
  openGraph: {
    title: "Staymitra — Best Hostels & PGs in Greater Noida | Zero Brokerage",
    description:
      "Find verified hostels & PGs near Galgotias, NIET, GL Bajaj & more colleges in Greater Noida. Compare rooms, schedule visits — zero brokerage, direct owner contact.",
    siteName: "Staymitra",
    type: "website",
    locale: "en_IN",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://staymitra.in",
  },
  twitter: {
    card: "summary_large_image",
    title: "Staymitra — Best Hostels & PGs in Greater Noida",
    description:
      "Zero brokerage hostels & PGs near Galgotias, NIET, GL Bajaj. Verified listings, direct owner contact.",
  },
  robots: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" as const, "max-video-preview": -1 },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.ico", type: "image/x-icon" }
    ],
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  },
  other: {
    "geo.region": "IN-UP",
    "geo.placename": "Greater Noida",
    "geo.position": "28.4744;77.5040",
    "ICBM": "28.4744, 77.5040",
    "revisit-after": "3 days",
    "rating": "General",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${outfit.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">
            <HeaderWrapper>
              <SiteHeader />
            </HeaderWrapper>
            <main className="flex-1">{children}</main>
            <FooterWrapper>
              <SiteFooter />
            </FooterWrapper>
          </div>
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              className: "font-sans",
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
