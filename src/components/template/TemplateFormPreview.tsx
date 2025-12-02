"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { renderTemplateBody } from "@/lib/renderTemplate";

export type TemplateField = {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  description?: string;
};

type Props = {
  title: string;
  body: string;
  fields: TemplateField[];
};

export function TemplateFormPreview({ title, body, fields }: Props) {
  const initial = useMemo(
    () =>
      Object.fromEntries(
        fields.map((f) => [f.name, f.placeholder ?? (f.required ? "" : "")])
      ),
    [fields]
  );
  const [values, setValues] = useState<Record<string, string>>(initial);
  const preview = useMemo(() => renderTemplateBody(body, values), [body, values]);

  return (
    <Card className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-h3">Fill placeholders</h3>
          <Pill tone="gray" className="text-xs">
            Live preview
          </Pill>
        </div>
        <div className="space-y-3">
          {fields.map((field) => (
            <label
              key={field.name}
              className="flex flex-col gap-1 rounded-lg border border-mdt-border px-3 py-2 text-sm dark:border-mdt-border-dark"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-mdt-text dark:text-mdt-text-dark">
                  {field.label ?? field.name}
                </span>
                {field.required && <span className="text-[11px] text-mdt-muted">Required</span>}
              </div>
              <input
                className="w-full rounded-md border border-mdt-border px-2 py-1 text-sm text-mdt-text outline-none focus:border-indigo-400 focus:ring focus:ring-indigo-100 dark:border-mdt-border-dark dark:bg-mdt-bg-dark dark:text-mdt-text-dark"
                placeholder={field.placeholder}
                value={values[field.name] ?? ""}
                onChange={(e) => setValues((prev) => ({ ...prev, [field.name]: e.target.value }))}
              />
              {field.description && (
                <p className="text-xs text-mdt-muted dark:text-mdt-muted-dark">{field.description}</p>
              )}
            </label>
          ))}
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setValues(initial)}>
            Reset
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigator.clipboard.writeText(preview)}>
            Copy preview
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-h3">Live preview</h3>
        <Card className="min-h-[240px] space-y-3 border border-mdt-border bg-white p-4 text-sm leading-6 shadow-inner dark:border-mdt-border-dark dark:bg-mdt-bg-dark">
          <p className="font-semibold text-mdt-text dark:text-mdt-text-dark">{title}</p>
          <pre className="whitespace-pre-wrap font-sans text-mdt-text dark:text-mdt-text-dark">{preview}</pre>
        </Card>
      </div>
    </Card>
  );
}
