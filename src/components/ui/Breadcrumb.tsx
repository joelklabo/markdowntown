import Link from "next/link";

type Segment = { href?: string; label: string };

export function Breadcrumb({ segments }: { segments: Segment[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-mdt-muted flex flex-wrap items-center gap-2">
      {segments.map((seg, idx) => (
        <span key={`${seg.label}-${idx}`} className="flex items-center gap-2">
          {seg.href ? (
            <Link href={seg.href} className="hover:underline">
              {seg.label}
            </Link>
          ) : (
            <span className="text-mdt-text dark:text-mdt-text-dark">{seg.label}</span>
          )}
          {idx < segments.length - 1 && <span aria-hidden>/</span>}
        </span>
      ))}
    </nav>
  );
}
