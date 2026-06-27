export const metadata = {
  title: "Terms of Service",
  description: "Staymitra terms of service.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: April 2026</p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="font-display text-lg font-bold text-foreground">1. Acceptance</h2>
          <p className="mt-2">
            By accessing or using Staymitra (&quot;the Platform&quot;), you agree to these Terms of Service. If you do not agree, please do not use the Platform.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold text-foreground">2. Service Description</h2>
          <p className="mt-2">
            Staymitra connects people seeking hostel or paying guest accommodation (&quot;Seekers&quot;) with property owners (&quot;Owners&quot;). We do not own, operate, or manage any listed properties. We are a lead-generation platform only.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold text-foreground">3. User Accounts</h2>
          <p className="mt-2">
            You must provide accurate information when registering. You are responsible for maintaining the security of your account credentials.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold text-foreground">4. Owner Responsibilities</h2>
          <p className="mt-2">
            Owners must ensure that all listing information is accurate, up-to-date, and not misleading. Owners are solely responsible for their properties and interactions with seekers.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold text-foreground">5. Limitation of Liability</h2>
          <p className="mt-2">
            Staymitra is not liable for the quality, safety, or legality of listed properties. We do not mediate disputes between owners and seekers.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold text-foreground">6. Changes</h2>
          <p className="mt-2">
            We may update these terms at any time. Continued use of the Platform after changes constitutes acceptance.
          </p>
        </section>
      </div>
    </div>
  );
}
