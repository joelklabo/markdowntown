"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";

type Props = {
  initialQuery: string;
  baseQueryString: string;
  debounceMs?: number;
};

export function BrowseSearch({ initialQuery, baseQueryString, debounceMs = 250 }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  const baseParams = useMemo(() => new URLSearchParams(baseQueryString), [baseQueryString]);

  useEffect(() => {
    const id = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams?.toString() ?? "");
        // reset q
        if (value.trim()) {
          params.set("q", value.trim());
        } else {
          params.delete("q");
        }
        // ensure existing base params persist
        baseParams.forEach((val, key) => {
          if (!params.has(key)) params.append(key, val);
        });
        const search = params.toString();
        router.replace(`/browse${search ? `?${search}` : ""}`, { scroll: false });
      });
    }, debounceMs);
    return () => clearTimeout(id);
  }, [value, debounceMs, router, searchParams, baseParams]);

  return (
    <div className="relative flex-1">
      <Input
        type="search"
        name="q"
        id="browse-search-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search snippets, templates…"
        className="bg-mdt-surface-subtle pr-14 shadow-inner"
        aria-label="Search library"
      />
      {isPending && (
        <Text as="span" size="caption" tone="muted" className="absolute right-2 top-2">
          Updating…
        </Text>
      )}
    </div>
  );
}
