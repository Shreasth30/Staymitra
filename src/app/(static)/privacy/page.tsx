export const metadata = {
  title: "Privacy Policy",
  description: "Staymitra privacy policy — how we handle your data.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: April 2026</p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="font-display text-lg font-bold text-foreground">1. Information We Collect</h2>
          <p className="mt-2">
            We collect the information you provide during registration (name, email, phone) and usage data such as pages visited and search filters used.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold text-foreground">2. How We Use Your Data</h2>
          <p className="mt-2">
            Your data is used to provide and improve the Staymitra service, facilitate communication between seekers and owners, and send relevant notifications.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold text-foreground">3. Data Sharing</h2>
          <p className="mt-2">
            We do not sell your personal data. Your contact information is shared with property owners only when you submit a visit or callback request.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold text-foreground">4. Data Security</h2>
          <p className="mt-2">
            We use industry-standard security measures including encrypted connections (HTTPS) and row-level security on our database to protect your data.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold text-foreground">5. Your Rights</h2>
          <p className="mt-2">
            You may request access to, correction of, or deletion of your personal data by contacting us at support@staymitra.com.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold text-foreground">6. Cookies</h2>
          <p className="mt-2">
            We use essential cookies for authentication. No third-party tracking cookies are used.
          </p>
        </section>
      </div>
    </div>
  );
}
