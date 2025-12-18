import { notFound } from "next/navigation";
import { featureFlags } from "@/lib/flags";
import { CityLogoLabClient } from "./CityLogoLabClient";

export const dynamic = "force-dynamic";

export default function CityLogoLabPage() {
  if (!featureFlags.labsCityLogo) notFound();
  return <CityLogoLabClient />;
}

