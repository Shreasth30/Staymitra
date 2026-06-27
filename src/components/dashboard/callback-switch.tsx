"use client";

import { useState, useTransition } from "react";
import { setPropertyCallbackEnabled } from "@/app/dashboard/actions";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type Props = {
  propertyId: string;
  initialEnabled: boolean;
};

export function CallbackSwitch({ propertyId, initialEnabled }: Props) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-4">
      <div className="space-y-0.5">
        <Label htmlFor="cb-toggle" className="text-base">
          Callback requests
        </Label>
        <p className="text-sm text-muted-foreground">
          When off, guests cannot request a call from your public page.
        </p>
      </div>
      <Switch
        id="cb-toggle"
        checked={enabled}
        disabled={pending}
        onCheckedChange={(checked) => {
          setEnabled(checked);
          startTransition(async () => {
            try {
              await setPropertyCallbackEnabled(propertyId, checked);
            } catch {
              setEnabled(!checked);
            }
          });
        }}
      />
    </div>
  );
}
