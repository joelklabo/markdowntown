export const featureFlags = {
  publicLibrary: process.env.PUBLIC_LIBRARY === "1" || process.env.PUBLIC_LIBRARY === "true",
  builderV2: process.env.BUILDER_V2 === "1" || process.env.BUILDER_V2 === "true",
  templatesV1: process.env.TEMPLATES_V1 === "1" || process.env.TEMPLATES_V1 === "true",
  engagementV1: process.env.ENGAGEMENT_V1 === "1" || process.env.ENGAGEMENT_V1 === "true",
};
