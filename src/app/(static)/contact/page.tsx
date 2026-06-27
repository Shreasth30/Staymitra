import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MapPin } from "lucide-react";

export const metadata = {
  title: "Contact",
  description: "Get in touch with the Staymitra team.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl font-bold tracking-tight animate-fade-in-up">
        Contact us
      </h1>
      <p className="mt-4 text-lg text-muted-foreground animate-fade-in-up delay-100">
        Have a question, feedback, or partnership inquiry? We&apos;d love to hear from you.
      </p>

      <div className="mt-12 grid gap-8 lg:grid-cols-5">
        <Card className="lg:col-span-3 animate-fade-in-up delay-200">
          <CardHeader>
            <CardTitle>Send a message</CardTitle>
            <CardDescription>We typically respond within 24 hours.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" required placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required placeholder="you@mail.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="How can we help?" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" rows={4} required placeholder="Tell us more…" />
              </div>
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Send message
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2 animate-fade-in-up delay-300">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <h3 className="mt-3 font-display font-bold">Email</h3>
            <p className="mt-1 text-sm text-muted-foreground">support@staymitra.com</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <MapPin className="h-5 w-5" />
            </div>
            <h3 className="mt-3 font-display font-bold">Location</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Bengaluru, Karnataka, India
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
