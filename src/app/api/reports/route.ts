import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import fs from "node:fs";
import path from "node:path";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: tighten auth (admin list) once roles exist
  const file = path.join(process.cwd(), "logs", "abuse-signals.log");
  if (!fs.existsSync(file)) return NextResponse.json([]);
  const lines = fs.readFileSync(file, "utf8").trim().split("\n").filter(Boolean);
  const entries = lines.map((l) => {
    try {
      return JSON.parse(l);
    } catch (e) {
      return { raw: l };
    }
  });
  return NextResponse.json(entries.slice(-200));
}
