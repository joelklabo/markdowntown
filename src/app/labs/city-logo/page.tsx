import { notFound } from "next/navigation";
import { featureFlags } from "@/lib/flags";
import { CityLogoLabClient } from "./CityLogoLabClient";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function firstString(value: string | string[] | undefined): string | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

function parseTimeOfDay(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  if (parsed < 0 || parsed > 1) return undefined;
  return parsed;
}

export default async function CityLogoLabPage(props: { searchParams: Promise<SearchParams> }) {
  if (!featureFlags.labsCityLogo) notFound();

  const searchParams = await props.searchParams;
  const snapshotMode = firstString(searchParams.snapshot) === "1";
  const timeOfDay = parseTimeOfDay(firstString(searchParams.timeOfDay));
  const event = firstString(searchParams.event);

  return (
    <CityLogoLabClient
      snapshotMode={snapshotMode}
      initialTimeOfDay={timeOfDay}
      initialEvent={event === "ambulance" ? "ambulance" : undefined}
    />
  );
}
