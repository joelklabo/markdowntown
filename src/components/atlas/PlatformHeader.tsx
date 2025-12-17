import { EvidenceBadge } from "@/components/atlas/EvidenceBadge";
import { Heading } from "@/components/ui/Heading";
import { Row, Stack } from "@/components/ui/Stack";
import { Text } from "@/components/ui/Text";
import type { PlatformFacts } from "@/lib/atlas/types";

function isoDate(value: string): string | null {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

type PlatformHeaderProps = {
  facts: PlatformFacts;
};

export function PlatformHeader({ facts }: PlatformHeaderProps) {
  const lastVerified = isoDate(facts.lastVerified);

  return (
    <header className="space-y-mdt-3">
      <Row gap={2} align="center" wrap className="text-body-xs text-mdt-muted">
        <span className="font-mono text-mdt-text">{facts.platformId}</span>
        <span aria-hidden>·</span>
        <span>Last verified</span>
        {lastVerified ? (
          <time dateTime={facts.lastVerified} className="font-mono text-mdt-text">
            {lastVerified}
          </time>
        ) : (
          <span className="font-mono text-mdt-text" aria-label="Last verified unknown">
            —
          </span>
        )}
        {facts.docHome ? <EvidenceBadge url={facts.docHome} label="Docs" /> : null}
      </Row>

      <Stack gap={2}>
        <Heading level="h1">{facts.name}</Heading>
        <Text tone="muted">
          Platform facts from <span className="font-mono">atlas/facts/{facts.platformId}.json</span>.
        </Text>
      </Stack>
    </header>
  );
}
