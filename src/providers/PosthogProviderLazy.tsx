"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

const LazyPosthog = dynamic(() => import("./PosthogProvider").then((m) => m.PosthogProvider), {
  ssr: false,
  loading: () => null,
});

export function PosthogProviderLazy({ children }: { children: ReactNode }) {
  return <LazyPosthog>{children}</LazyPosthog>;
}
