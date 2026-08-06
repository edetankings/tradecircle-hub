import { useEffect, useState } from "react";
import { getSignedStorageUrl } from "@/lib/storage";

interface StorageImageProps {
  path: string | null | undefined;
  alt: string;
  className?: string;
}

/** Renders an image stored in the private screenshots bucket using a signed URL. */
export function StorageImage({ path, alt, className }: StorageImageProps) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getSignedStorageUrl(path).then((signed) => {
      if (active) setUrl(signed);
    });
    return () => {
      active = false;
    };
  }, [path]);

  if (!url) return <div className={`${className ?? ""} bg-muted animate-pulse`} aria-hidden />;
  return <img src={url} alt={alt} className={className} />;
}

/** Hook variant for cases where only the URL string is needed. */
export function useSignedStorageUrl(path: string | null | undefined) {
  const [url, setUrl] = useState<string | undefined>(undefined);
  useEffect(() => {
    let active = true;
    getSignedStorageUrl(path).then((signed) => {
      if (active) setUrl(signed ?? undefined);
    });
    return () => {
      active = false;
    };
  }, [path]);
  return url;
}
