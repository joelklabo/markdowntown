"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
      <input
        type="search"
        name="q"
        id="browse-search-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search snippets, templates…"
        className="w-full rounded-md border border-mdt-border bg-white px-3 py-2 text-sm text-mdt-text shadow-inner outline-none transition focus:border-indigo-400 focus:ring focus:ring-indigo-100 dark:border-mdt-border-dark dark:bg-mdt-bg-dark dark:text-mdt-text-dark dark:focus:border-indigo-300"
        aria-label="Search library"
      />
      {isPending && <span className="absolute right-2 top-2 text-[11px] text-mdt-muted">Updating…</span>}
    </div>
  );
}
