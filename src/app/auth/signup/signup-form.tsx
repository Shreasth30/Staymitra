"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("seeker");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone || null,
          role,
        },
      },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      setMessage("Verification email sent! Please check your inbox (and spam folder) to confirm your account.");
      setLoading(false);
      return;
    }
    if (role === "owner") {
      router.push("/dashboard");
    } else {
      router.push("/search");
    }
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md border-border/60 shadow-xl">
      <form onSubmit={onSubmit}>
        <CardHeader className="space-y-2 pb-6">
          <CardTitle className="font-display text-2xl font-bold">Create an account</CardTitle>
          <CardDescription className="text-[15px]">
            Find a stay as a guest, or list your hostel or PG as an owner.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive" role="alert">
              {error}
            </div>
          ) : null}
          {message ? (
            <div className="rounded-lg bg-primary/10 px-4 py-3 text-sm font-medium text-primary" role="status">
              {message}
            </div>
          ) : null}
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-accent/40 p-1 mb-2">
            <button
              type="button"
              onClick={() => setRole("seeker")}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-semibold transition-all",
                role === "seeker"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Looking for a stay
            </button>
            <button
              type="button"
              onClick={() => setRole("owner")}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-semibold transition-all",
                role === "owner"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              List property
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-semibold">Full name</Label>
              <Input
                id="fullName"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-11 bg-accent/40 border-0 focus-visible:ring-1"
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold">Phone <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-11 bg-accent/40 border-0 focus-visible:ring-1"
                placeholder="+91…"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 bg-accent/40 border-0 focus-visible:ring-1"
              placeholder="you@email.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 bg-accent/40 border-0 focus-visible:ring-1"
              placeholder="••••••••"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pt-2">
          <Button
            type="submit"
            className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 shadow-sm"
            disabled={loading}
          >
            {loading ? "Creating account…" : "Sign up"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold text-foreground underline underline-offset-4 hover:text-primary">
              Log in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
