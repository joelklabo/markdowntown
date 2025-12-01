import { NextResponse } from "next/server";
import { listPublicItems, type PublicItemType } from "@/lib/publicItems";

function parseType(input: string | null): PublicItemType | "all" {
  if (input === "snippet" || input === "template" || input === "file") return input;
  return "all";
}

function parseSort(input: string | null): "recent" | "views" | "copies" {
  if (input === "views" || input === "copies") return input;
  if (input === "trending" || input === "top") return "views";
  if (input === "copied") return "copies";
  return "recent";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const tags = url.searchParams.getAll("tag");
  const type = parseType(url.searchParams.get("type"));
  const sort = parseSort(url.searchParams.get("sort"));
  const limit = Number(url.searchParams.get("limit") ?? 30);

  try {
    const items = await listPublicItems({
      limit: Math.min(Math.max(limit, 1), 90),
      tags,
      type,
      sort,
      search: q,
    });

    return NextResponse.json({ items });
  } catch (err) {
    console.error("public search failed", err);
    return NextResponse.json({ items: [] }, { status: 500 });
  }
}
