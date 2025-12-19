"use client";

import dynamic from "next/dynamic";
import type { CityLogoLabClientProps } from "./CityLogoLabClient";

const CityLogoLabClientNoSSRInner = dynamic(() => import("./CityLogoLabClient").then((m) => m.CityLogoLabClient), {
  ssr: false,
  loading: () => <div className="p-mdt-6 text-caption text-mdt-muted">Loading logo lab…</div>,
});

export function CityLogoLabClientNoSSR(props: CityLogoLabClientProps) {
  return <CityLogoLabClientNoSSRInner {...props} />;
}
