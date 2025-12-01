"use client";

import { useEffect, useRef } from "react";
import { envPublic } from "@/config/env.public";
const key = envPublic.NEXT_PUBLIC_POSTHOG_KEY;
const host = envPublic.NEXT_PUBLIC_POSTHOG_HOST;

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
