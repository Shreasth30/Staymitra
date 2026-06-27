"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const [supabase] = useState(() =>
    createClient({
      auth: {
        flowType: "implicit",
      },
    }),
  );

  useEffect(() => {
    async function handleExchange() {
      setError(null);
      // Wait a tiny moment to ensure client-side hash parsing is completed
      await new Promise((resolve) => setTimeout(resolve, 200));

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        setError(sessionError.message);
        setHasSession(false);
      } else if (!session) {
        setError("Invalid or expired password reset link. Please request a new one.");
        setHasSession(false);
      } else {
        setHasSession(true);
      }
      setIsVerifying(false);
    }

    handleExchange();
  }, [supabase]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError(null);
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/"), 2000);
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md border-border/80 shadow-lg animate-fade-in-up">
        <CardHeader className="space-y-1">
          <CardTitle className="font-display text-2xl">New password</CardTitle>
          <CardDescription>Enter your new password below.</CardDescription>
        </CardHeader>
        {isVerifying ? (
          <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground animate-pulse">Verifying reset link...</p>
          </CardContent>
        ) : done ? (
          <CardContent>
            <div className="rounded-lg bg-success/10 p-4 text-sm text-success">
              Password updated! Redirecting…
            </div>
          </CardContent>
        ) : !hasSession ? (
          <>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                {error || "Invalid or expired password reset link."}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => router.push("/auth/forgot-password")}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Request new link
              </Button>
            </CardFooter>
          </>
        ) : (
          <form onSubmit={onSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? "Updating…" : "Update password"}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
