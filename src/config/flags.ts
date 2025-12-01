import { z } from "zod";

const bool = () => z.enum(["true", "false", "1", "0", "yes", "no"]).transform((v) =>
  ["true", "1", "yes"].includes(v)
);

const flagsSchema = z.object({
  FLAG_PUBLIC_LIBRARY: bool().optional(),
  FLAG_BUILDER_V2: bool().optional(),
  FLAG_TEMPLATES_V1: bool().optional(),
  FLAG_ANALYTICS: bool().optional(),
});

const parsed = flagsSchema.safeParse(process.env);

if (!parsed.success) {
  const formatted = parsed.error.flatten().fieldErrors;
  throw new Error(`Invalid flag environment variables: ${JSON.stringify(formatted, null, 2)}`);
}

const defaults = {
  FLAG_PUBLIC_LIBRARY: false,
  FLAG_BUILDER_V2: false,
  FLAG_TEMPLATES_V1: false,
  FLAG_ANALYTICS: true,
} as const;

export const flags = { ...defaults, ...Object.fromEntries(Object.entries(parsed.data).filter(([, v]) => v !== undefined)) } as Record<keyof typeof defaults, boolean>;
