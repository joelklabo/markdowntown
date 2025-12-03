"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const STORAGE_KEY = "mdt_whats_new_dismissed_v2025-12";

export function WhatNewBanner() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const dismissed = typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEY) === "1";
    if (!dismissed) {
      // defer to avoid cascading render warning
      setTimeout(() => setVisible(true), 0);
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="mx-auto max-w-6xl px-4">
      <div className="mt-3 flex flex-col gap-2 rounded-mdt-md border border-mdt-border bg-mdt-surface shadow-mdt-sm px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-mdt-text">What’s new: December 2025 redesign</p>
          <p className="text-sm text-mdt-muted">
            Dual-theme tokens, calmer landing, faceted browse, builder status strip, and new quality signals.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" asChild>
            <Link href="/changelog">View changelog</Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              window.localStorage.setItem(STORAGE_KEY, "1");
              setVisible(false);
            }}
            aria-label="Dismiss what's new"
          >
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
}
