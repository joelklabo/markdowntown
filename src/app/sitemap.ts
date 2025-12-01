import type { MetadataRoute } from "next";
import { featureFlags } from "@/lib/flags";
import { sampleItems } from "@/lib/sampleContent";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!featureFlags.publicLibrary) {
    // Return minimal sitemap to avoid indexing while flagged off.
    return [];
  }

  const baseUrl = "https://markdown.town";
  const staticPaths: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/browse`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/templates`, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/tags`, changeFrequency: "daily", priority: 0.6 },
  ];

  const itemPaths: MetadataRoute.Sitemap = sampleItems.map((item) => {
    const typePath = item.type === "template" ? "templates" : item.type === "file" ? "files" : "snippets";
    const slug = item.slug ?? item.id;
    return {
      url: `${baseUrl}/${typePath}/${slug}`,
      changeFrequency: "weekly",
      priority: 0.7,
    };
  });

  return [...staticPaths, ...itemPaths];
}
