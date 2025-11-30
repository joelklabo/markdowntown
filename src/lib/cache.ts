import { cache } from "react";
import { prisma } from "./prisma";

// Cached fetch of user sections with ordering
export const getSectionsCached = cache(async (userId: string) => {
  return prisma.section.findMany({
    where: { userId },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
});
