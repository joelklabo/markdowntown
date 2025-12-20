function envBool(value: string | undefined) {
  return value === "1" || value === "true";
}

function envBoolDefaultTrue(value: string | undefined) {
  if (value === undefined) return true;
  if (value === "0" || value === "false") return false;
  return envBool(value);
}

const isServer = typeof window === "undefined";

export const featureFlags = {
  publicLibrary: isServer && envBool(process.env.PUBLIC_LIBRARY),
  builderV2: isServer && envBool(process.env.BUILDER_V2),
  templatesV1: isServer && envBool(process.env.TEMPLATES_V1),
  engagementV1: isServer && envBool(process.env.ENGAGEMENT_V1),
  themeRefreshV1: envBool(process.env.NEXT_PUBLIC_THEME_REFRESH_V1),
  wordmarkAnimV1: envBoolDefaultTrue(process.env.NEXT_PUBLIC_WORDMARK_ANIM_V1),
  wordmarkBannerV1: envBoolDefaultTrue(process.env.NEXT_PUBLIC_WORDMARK_BANNER_V1),
  labsCityLogo: isServer && envBool(process.env.LABS_CITY_LOGO),
};
