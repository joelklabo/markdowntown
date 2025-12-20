"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackUiEvent } from "@/lib/analytics";

export function UxTelemetry() {
  const pathname = usePathname();
  const shellTracked = useRef(false);

  useEffect(() => {
    if (!pathname) return;
    trackUiEvent("ui_route_view", { route: pathname });
    if (!shellTracked.current) {
      trackUiEvent("ui_shell_loaded", { route: pathname });
      shellTracked.current = true;
    }
  }, [pathname]);

  return null;
}
