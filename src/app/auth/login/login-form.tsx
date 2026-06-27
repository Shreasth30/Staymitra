"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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

export function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get("next") ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    // Fetch role to decide redirect
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (next !== "/") {
        router.push(next);
      } else if (profile?.role === "owner") {
        router.push("/dashboard");
      } else {
        router.push("/");
      }
    } else {
      router.push(next);
    }
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md border-border/60 shadow-xl">
      <form onSubmit={onSubmit}>
        <CardHeader className="space-y-2 pb-6">
          <CardTitle className="font-display text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription className="text-[15px]">
            Log in to your Staymitra account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive" role="alert">
              {error}
            </div>
          )}
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
              autoComplete="current-password"
              required
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
            {loading ? "Signing in…" : "Log in"}
          </Button>
          <Link
            href="/auth/forgot-password"
            className="text-center text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            Forgot your password?
          </Link>
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="font-semibold text-foreground underline underline-offset-4 hover:text-primary">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
