"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type Props = {
  title: string;
  rendered: string;
  raw: string;
};

export function SnippetTabs({ title, rendered, raw }: Props) {
  const [tab, setTab] = useState<"rendered" | "raw">("rendered");

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={tab === "rendered" ? "primary" : "ghost"}
            onClick={() => setTab("rendered")}
          >
            Rendered
          </Button>
          <Button
            size="sm"
            variant={tab === "raw" ? "primary" : "ghost"}
            onClick={() => setTab("raw")}
          >
            Raw
          </Button>
        </div>
        <Button size="sm" variant="secondary" onClick={() => navigator.clipboard.writeText(tab === "raw" ? raw : rendered)}>
          Copy {tab}
        </Button>
      </div>

      {tab === "rendered" ? (
        <div className="rounded-lg border border-mdt-border bg-mdt-surface p-4 text-sm leading-6">
          <h3 className="text-h4 mb-2 text-mdt-text">{title}</h3>
          <p className="text-mdt-text">{rendered}</p>
        </div>
      ) : (
        <pre className="rounded-lg border border-mdt-border bg-mdt-surface-subtle p-4 font-mono text-xs whitespace-pre-wrap text-mdt-text">
{raw}
        </pre>
      )}
    </Card>
  );
}
