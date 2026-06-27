"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImagePlus } from "lucide-react";

type Props = {
  propertyId: string;
};

export function PropertyPhotoUpload({ propertyId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Not signed in");
      setLoading(false);
      return;
    }
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/${propertyId}/property_photos/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("property-images")
      .upload(path, file, { upsert: false });
    if (upErr) {
      setError(upErr.message);
      setLoading(false);
      return;
    }
    const { count } = await supabase
      .from("property_photos")
      .select("*", { count: "exact", head: true })
      .eq("property_id", propertyId);
    const sortOrder = (count ?? 0) + 1;
    const { error: insErr } = await supabase.from("property_photos").insert({
      property_id: propertyId,
      storage_path: path,
      sort_order: sortOrder,
    });
    setLoading(false);
    if (insErr) {
      setError(insErr.message);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">Add photo</Label>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" disabled={loading} asChild>
          <label className="cursor-pointer">
            <ImagePlus className="mr-1 h-4 w-4" />
            {loading ? "Uploading…" : "Upload Property Photo"}
            <Input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={onChange}
              disabled={loading}
            />
          </label>
        </Button>
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
