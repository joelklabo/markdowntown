import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Templates | mark downtown",
  description: "Templates with placeholders you can fill and export to agents.md.",
};

export default async function TemplatesPage() {
  redirect("/library?type=template");
}
