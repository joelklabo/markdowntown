import { Metadata } from "next";
import { BuilderClient } from "@/components/BuilderClient";

export const metadata: Metadata = {
  title: "Builder | MarkdownTown",
  description: "Assemble snippets and templates into a single agents.md and export without signing in.",
};

export default function BuilderPage() {
  return <BuilderClient />;
}
