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
    <div className="grid w-full gap-mdt-2 sm:grid-cols-3">
      {items.map((item) => (
        <Card
          key={item.label}
          className="flex items-center justify-between gap-mdt-3 bg-mdt-surface-subtle px-mdt-3 py-mdt-2 text-body-sm shadow-mdt-sm"
        >
          <div className="flex items-center gap-mdt-2 text-mdt-muted">
            <span aria-hidden>{item.icon}</span>
            <span className="text-caption">{item.label}</span>
          </div>
          <span className="font-semibold text-mdt-text">{item.value.toLocaleString()}</span>
        </Card>
      ))}
    </div>
  );
}
