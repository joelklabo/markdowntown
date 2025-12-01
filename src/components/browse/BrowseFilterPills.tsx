"use client";

import Link from "next/link";
import { Pill } from "@/components/ui/Pill";
import { track } from "@/lib/analytics";

type Option = { label: string; key: string; href: string; active: boolean };
type TagOption = { label: string; href: string; active: boolean };
type ActiveTag = { label: string; removeHref: string };

type Props = {
  sortOptions: Option[];
  typeOptions: Option[];
  popularTags: TagOption[];
  activeTags: ActiveTag[];
  clearTagsHref: string;
};

export function BrowseFilterPills({ sortOptions, typeOptions, popularTags, activeTags, clearTagsHref }: Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-mdt-text dark:text-mdt-text-dark">Sort</p>
        <div className="flex flex-wrap gap-2">
          {sortOptions.map((option) => (
            <Pill
              key={option.key}
              tone={option.active ? "blue" : "gray"}
            >
              <Link
                href={option.href}
                onClick={() => track("browse_filter_select", { type: "sort", value: option.key })}
              >
                {option.label}
              </Link>
            </Pill>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-mdt-text dark:text-mdt-text-dark">Types</p>
        <div className="flex flex-wrap gap-2">
          {typeOptions.map((option) => (
            <Pill
              key={option.key}
              tone={option.active ? "blue" : "gray"}
            >
              <Link
                href={option.href}
                onClick={() => track("browse_filter_select", { type: "content_type", value: option.key })}
              >
                {option.label}
              </Link>
            </Pill>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-mdt-text dark:text-mdt-text-dark">Popular tags</p>
        <div className="flex flex-wrap gap-2">
          {popularTags.map((tag) => (
            <Pill key={tag.label} tone={tag.active ? "blue" : "gray"}>
              <Link href={tag.href} onClick={() => track("browse_filter_select", { type: "tag", value: tag.label })}>
                #{tag.label}
              </Link>
            </Pill>
          ))}
        </div>
      </div>

      {activeTags.length > 0 && (
        <div className="flex flex-wrap gap-2" aria-label="Active tag filters">
          {activeTags.map((tag) => (
            <Pill key={tag.label} tone="blue">
              <span>#{tag.label}</span>
              <Link
                href={tag.removeHref}
                className="ml-1 text-[11px] underline"
                aria-label={`Remove tag ${tag.label}`}
                onClick={() => track("browse_filter_remove", { type: "tag", value: tag.label })}
              >
                ×
              </Link>
            </Pill>
          ))}
          <Link href={clearTagsHref} className="text-sm text-indigo-600 underline" onClick={() => track("browse_filter_clear_tags")}>
            Clear filters
          </Link>
        </div>
      )}
    </div>
  );
}
