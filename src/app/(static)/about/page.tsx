import { Building2, Users, Shield, MapPin } from "lucide-react";

export const metadata = {
  title: "About",
  description: "Learn about Staymitra — India's hassle-free platform for finding hostels and PGs.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl font-bold tracking-tight animate-fade-in-up">
        About <span className="text-gradient">Staymitra</span>
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground animate-fade-in-up delay-100">
        Staymitra is India&apos;s hassle-free platform connecting students and
        working professionals directly with hostel and PG owners — zero
        brokerage, zero hidden fees.
      </p>

      <div className="mt-14 grid gap-8 sm:grid-cols-2">
        {[
          {
            icon: Building2,
            title: "Our Mission",
            text: "To make finding affordable and quality shared accommodation as simple as a few clicks. No middlemen, no commissions.",
          },
          {
            icon: Users,
            title: "Who We Serve",
            text: "Students, interns, and working professionals relocating to new cities who need a safe, affordable place to stay.",
          },
          {
            icon: Shield,
            title: "Trust & Safety",
            text: "Every listing is posted by verified property owners. We provide direct owner contact — you always know who you're dealing with.",
          },
          {
            icon: MapPin,
            title: "Pan-India",
            text: "From Bengaluru to Delhi, Hyderabad to Pune — we're growing to cover every major city across India.",
          },
        ].map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="rounded-2xl border border-border bg-card p-6 shadow-sm"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="mt-4 font-display text-xl font-bold">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
