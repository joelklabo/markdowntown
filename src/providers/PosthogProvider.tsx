"use client";

import { useEffect, useRef } from "react";
const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";

export function PosthogProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!key || initialized.current) return;
    import("posthog-js").then(({ default: ph }) => {
      ph.init(key, {
        api_host: host,
        capture_pageview: true,
        persistence: "memory",
      });
      initialized.current = true;
    });
  }, []);

  return <>{children}</>;
}
