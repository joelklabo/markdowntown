import { Card } from "@/components/ui/Card";

type Props = {
  views: number;
  copies: number;
  votes?: number;
};

export function DetailStats({ views, copies, votes = 0 }: Props) {
  const items = [
    { label: "Views", value: views, icon: "👁️" },
    { label: "Copies", value: copies, icon: "📋" },
    { label: "Votes", value: votes, icon: "👍" },
  ];

  return (
    <div className="grid gap-2 sm:grid-cols-3 w-full">
      {items.map((item) => (
        <Card key={item.label} className="flex items-center justify-between gap-3 bg-[color:var(--mdt-color-surface-subtle)] px-3 py-2 text-sm shadow-mdt-sm">
          <div className="flex items-center gap-2 text-mdt-muted">
            <span aria-hidden>{item.icon}</span>
            <span className="text-caption">{item.label}</span>
          </div>
          <span className="font-semibold text-mdt-text">{item.value.toLocaleString()}</span>
        </Card>
      ))}
    </div>
  );
}
