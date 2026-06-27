"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { submitVisitRequest, submitCallbackRequest } from "@/app/stay/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  propertyId: string;
  propertyName: string;
  slug: string;
  callbackEnabled: boolean;
  isLoggedIn: boolean;
  /** Narrow layout for fixed mobile bar */
  compact?: boolean;
};

export function StayActions({
  propertyId,
  propertyName,
  slug,
  callbackEnabled,
  isLoggedIn,
  compact,
}: Props) {
  const [visitOpen, setVisitOpen] = useState(false);
  const [cbOpen, setCbOpen] = useState(false);
  const [visitLoading, setVisitLoading] = useState(false);
  const [cbLoading, setCbLoading] = useState(false);

  const btnSize = compact ? "default" : "lg";
  const containerClass = compact ? "flex w-auto gap-2" : "flex flex-col gap-3 w-full";

  if (!isLoggedIn) {
    return (
      <div className={containerClass}>
        <Button asChild size={btnSize} className="bg-primary text-primary-foreground hover:bg-primary/90 w-full shadow-md font-semibold">
          <Link href={`/auth/login?next=${encodeURIComponent(`/stay/${slug}`)}`}>
            {compact ? "Log in" : "Log in to schedule visit"}
          </Link>
        </Button>
        {callbackEnabled && !compact ? (
          <Button asChild size={btnSize} variant="outline" className="w-full">
            <Link href={`/auth/login?next=${encodeURIComponent(`/stay/${slug}`)}`}>
              Log in to request a call
            </Link>
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <Dialog open={visitOpen} onOpenChange={setVisitOpen}>
        <DialogTrigger asChild>
          <Button size={btnSize} className="bg-primary text-primary-foreground hover:bg-primary/90 w-full shadow-md font-semibold border-0">
            {compact ? "Visit" : "Schedule a visit"}
          </Button>
        </DialogTrigger>
        <DialogContent className="border-border/60">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setVisitLoading(true);
              const fd = new FormData(e.currentTarget);
              try {
                await submitVisitRequest(fd);
                setVisitOpen(false);
                toast.success("Visit request sent!", {
                  description: `${propertyName} will confirm your visit.`,
                });
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Something went wrong");
              } finally {
                setVisitLoading(false);
              }
            }}
          >
            <input type="hidden" name="property_id" value={propertyId} />
            <DialogHeader>
              <DialogTitle className="font-display font-bold text-2xl">Schedule a visit</DialogTitle>
              <DialogDescription>
                Pick a preferred time. {propertyName} will confirm with you.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-6">
              <div className="space-y-2">
                <Label htmlFor="preferred_at" className="text-sm font-semibold">Preferred date & time</Label>
                <Input
                  id="preferred_at"
                  name="preferred_at"
                  type="datetime-local"
                  required
                  className="bg-accent/40 border-0 focus-visible:ring-1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="note" className="text-sm font-semibold">Note (optional)</Label>
                <Textarea id="note" name="note" rows={3} placeholder="Anything we should know?" className="bg-accent/40 border-0 focus-visible:ring-1" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={visitLoading} className="bg-primary text-primary-foreground hover:bg-primary/90 w-full font-semibold h-11">
                {visitLoading ? "Sending…" : "Send request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {callbackEnabled ? (
        <Dialog open={cbOpen} onOpenChange={setCbOpen}>
          <DialogTrigger asChild>
            <Button size={btnSize} variant="outline" className="w-full font-semibold bg-background hover:bg-accent/50 border-border">
              {compact ? "Call" : "Request a callback"}
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border/60">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setCbLoading(true);
                const fd = new FormData(e.currentTarget);
                try {
                  await submitCallbackRequest(fd);
                  setCbOpen(false);
                  toast.success("Callback request sent!", {
                    description: "The owner will reach out to you soon.",
                  });
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Something went wrong");
                } finally {
                  setCbLoading(false);
                }
              }}
            >
              <input type="hidden" name="property_id" value={propertyId} />
              <DialogHeader>
                <DialogTitle className="font-display font-bold text-2xl">Request a callback</DialogTitle>
                <DialogDescription>
                  Share your number and the owner will reach out.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-6">
                <div className="space-y-2">
                  <Label htmlFor="contact_phone" className="text-sm font-semibold">Phone number</Label>
                  <Input
                    id="contact_phone"
                    name="contact_phone"
                    type="tel"
                    required
                    placeholder="+91…"
                    className="bg-accent/40 border-0 focus-visible:ring-1 h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm font-semibold">Message (optional)</Label>
                  <Textarea id="message" name="message" rows={3} className="bg-accent/40 border-0 focus-visible:ring-1" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={cbLoading} className="bg-primary text-primary-foreground hover:bg-primary/90 w-full font-semibold h-11">
                  {cbLoading ? "Sending…" : "Request call"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}
