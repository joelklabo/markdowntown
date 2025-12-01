import { NextResponse } from "next/server";
import { listPublicItems } from "@/lib/publicItems";
import { normalizeTags } from "@/lib/tags";

export const revalidate = 30;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") ?? "30");
  const sort = (url.searchParams.get("sort") ?? "recent") as "recent" | "views" | "copies";
  const type = (url.searchParams.get("type") ?? "all") as Parameters<typeof listPublicItems>[0]["type"];
  const q = url.searchParams.get("q");
  const tagsParam = url.searchParams.getAll("tag");
  const tagsCsv = url.searchParams.get("tags");
  const tagsRaw = tagsCsv ? tagsCsv.split(",") : tagsParam;
  const tags = normalizeTags(tagsRaw, { strict: false }).tags;

  const items = await listPublicItems({
    limit: Number.isNaN(limit) ? 30 : Math.min(Math.max(limit, 1), 200),
    sort,
    type,
    search: q,
    tags,
  });

  return NextResponse.json(items);
}
