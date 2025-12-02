import { sectionsRepo } from "@/services/sections";

export type PublicSection = {
  id: string;
  slug?: string | null;
  title: string;
  content: string;
  tags: string[];
  updatedAt: Date;
  createdAt: Date;
};

export async function listPublicSections(limit = 24): Promise<PublicSection[]> {
  return sectionsRepo.listPublic(limit);
}

export async function getPublicSection(idOrSlug: string): Promise<PublicSection | null> {
  return sectionsRepo.findByIdOrSlug(idOrSlug);
}
