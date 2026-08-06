import { supabase } from "@/integrations/supabase/client";

const BUCKET = "screenshots";

/** Normalizes a stored value (legacy public URL or plain path) into an object path. */
export function toStoragePath(value: string | null | undefined): string | null {
  if (!value) return null;
  const marker = `/${BUCKET}/`;
  const idx = value.indexOf(marker);
  if (idx !== -1) return decodeURIComponent(value.slice(idx + marker.length).split("?")[0]);
  return value;
}

/** Creates a short-lived signed URL for a private screenshots-bucket object. */
export async function getSignedStorageUrl(
  value: string | null | undefined,
  expiresIn = 3600
): Promise<string | null> {
  const path = toStoragePath(value);
  if (!path) return null;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresIn);
  if (error) return null;
  return data?.signedUrl ?? null;
}
