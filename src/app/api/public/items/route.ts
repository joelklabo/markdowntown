import { NextResponse } from "next/server";
import { listPublicItems, type ListPublicItemsInput } from "@/lib/publicItems";
import { normalizeTags } from "@/lib/tags";
import { cacheHeaders } from "@/config/cache";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") ?? "30");
  const sort = (url.searchParams.get("sort") ?? "recent") as "recent" | "views" | "copies";
  const typeParam = url.searchParams.get("type");
  const type = (typeParam ?? "all") as ListPublicItemsInput["type"];
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

  return NextResponse.json(items, { headers: cacheHeaders("browse") });
}
