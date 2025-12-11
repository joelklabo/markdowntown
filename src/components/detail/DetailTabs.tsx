"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";

type Props = {
  title: string;
  rendered: string;
  raw: string;
  copyLabel?: string;
};

export function DetailTabs({ title, rendered, raw, copyLabel = "Copy" }: Props) {
  const [tab, setTab] = useState<"rendered" | "raw">("rendered");

  function copyCurrent() {
    const content = tab === "raw" ? raw : rendered;
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      const result = navigator.clipboard.writeText(content);
      if (result && typeof (result as Promise<void>).catch === "function") {
        (result as Promise<void>).catch(() => {});
      }
    }
  }

  return (
    <Card className="space-y-mdt-3">
      <div className="flex flex-wrap items-center justify-between gap-mdt-3">
        <div className="flex gap-mdt-2">
          <Button size="xs" variant={tab === "rendered" ? "primary" : "ghost"} onClick={() => setTab("rendered")}>
            Rendered
          </Button>
          <Button size="xs" variant={tab === "raw" ? "primary" : "ghost"} onClick={() => setTab("raw")}>
            Raw
          </Button>
        </div>
        <Button size="xs" variant="secondary" onClick={copyCurrent}>
          {copyLabel} {tab}
        </Button>
      </div>

      {tab === "rendered" ? (
        <div className="rounded-mdt-lg border border-mdt-border bg-mdt-surface p-mdt-4 text-body-sm leading-6">
          <Heading level="h3" className="mb-mdt-2">
            {title}
          </Heading>
          <Text as="p" size="bodySm" className="whitespace-pre-wrap">
            {rendered}
          </Text>
        </div>
      ) : (
        <pre className="rounded-mdt-lg border border-mdt-border bg-mdt-surface-subtle p-mdt-4 font-mono text-caption whitespace-pre-wrap text-mdt-text">
{raw}
        </pre>
      )}
    </Card>
  );
}
