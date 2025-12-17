import { ArtifactType, Prisma, Visibility } from "@prisma/client";
import { fileURLToPath } from "node:url";
import { hasDatabaseEnv, prisma } from "../src/lib/prisma.ts";
import { safeParseUamV1 } from "../src/lib/uam/uamValidate.ts";
import { GLOBAL_SCOPE_ID, createEmptyUamV1, createUamTargetV1 } from "../src/lib/uam/uamTypes.ts";

const SEED_TAG = "official";
const SEED_VERSION = "1";

type SeedDefinition = {
  slug: string;
  type: ArtifactType;
  title: string;
  description: string;
  tags: string[];
  uam: unknown;
  stats?: Partial<Pick<Prisma.ArtifactUncheckedCreateInput, "views" | "copies" | "downloads" | "votesUp">>;
};

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values.map(v => v.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function buildSeedDefinitions(): SeedDefinition[] {
  const agent = createEmptyUamV1({
    title: "Official: Repo-aware coding assistant",
    description: "A pragmatic agents.md baseline: concise tone, tests-first, and safe tool usage.",
  });
  agent.scopes = [
    { id: GLOBAL_SCOPE_ID, kind: "global", name: "Global" },
    { id: "src", kind: "dir", dir: "src", name: "Source" },
  ];
  agent.blocks = [
    {
      id: "system",
      scopeId: GLOBAL_SCOPE_ID,
      kind: "markdown",
      title: "System",
      body: [
        "You are a precise, friendly coding assistant.",
        "Prefer small, safe changes; run tests; avoid unrelated refactors.",
      ].join("\n"),
    },
    {
      id: "quality",
      scopeId: "src",
      kind: "checklist",
      title: "Quality bar",
      body: ["- `pnpm lint`", "- `pnpm type-check`", "- `pnpm test`"].join("\n"),
    },
  ];
  agent.targets = [
    createUamTargetV1("agents-md"),
    createUamTargetV1("github-copilot"),
    createUamTargetV1("claude-code"),
  ];

  const template = createEmptyUamV1({
    title: "Official: Bug hunt session template",
    description: "A structured workflow for reproducing and fixing bugs with crisp acceptance criteria.",
  });
  template.scopes = [
    { id: GLOBAL_SCOPE_ID, kind: "global", name: "Global" },
    { id: "tests", kind: "glob", patterns: ["**/*.{test,spec}.*"], name: "Tests" },
  ];
  template.blocks = [
    {
      id: "template-body",
      scopeId: GLOBAL_SCOPE_ID,
      kind: "markdown",
      title: "Bug hunt",
      body: [
        "## Context",
        "- Environment:",
        "- Expected behavior:",
        "- Actual behavior:",
        "",
        "## Repro steps",
        "1.",
        "2.",
        "3.",
        "",
        "## Fix plan",
        "-",
        "",
        "## Verification",
        "- Add/adjust tests",
        "- Run `pnpm test`",
      ].join("\n"),
    },
    {
      id: "tests-checklist",
      scopeId: "tests",
      kind: "checklist",
      title: "Test notes",
      body: ["- Prefer deterministic fixtures", "- Cover the regression", "- Keep tests small"].join("\n"),
    },
  ];
  template.targets = [createUamTargetV1("agents-md"), createUamTargetV1("github-copilot")];

  const snippet = createEmptyUamV1({
    title: "Official: Post-deploy smoke checklist",
    description: "A compact checklist for validating API/UI health after deployment.",
  });
  snippet.scopes = [
    { id: GLOBAL_SCOPE_ID, kind: "global", name: "Global" },
    { id: "ops", kind: "dir", dir: "ops", name: "Ops" },
  ];
  snippet.blocks = [
    {
      id: "post-deploy",
      scopeId: GLOBAL_SCOPE_ID,
      kind: "checklist",
      title: "Post-deploy",
      body: [
        "- Confirm service is up (health checks green)",
        "- Run a basic end-to-end flow",
        "- Check logs for spikes/errors",
        "- Verify key dashboards",
      ].join("\n"),
    },
  ];
  snippet.targets = [createUamTargetV1("agents-md"), createUamTargetV1("github-copilot")];

  return [
    {
      slug: "official-repo-assistant",
      type: ArtifactType.ARTIFACT,
      title: agent.meta.title,
      description: agent.meta.description ?? "",
      tags: ["agents", "starter", SEED_TAG],
      uam: agent,
      stats: { views: 1250, copies: 240, votesUp: 52 },
    },
    {
      slug: "official-bug-hunt-template",
      type: ArtifactType.TEMPLATE,
      title: template.meta.title,
      description: template.meta.description ?? "",
      tags: ["template", "qa", SEED_TAG],
      uam: template,
      stats: { views: 980, copies: 180, votesUp: 41 },
    },
    {
      slug: "official-post-deploy-smoke",
      type: ArtifactType.MODULE,
      title: snippet.meta.title,
      description: snippet.meta.description ?? "",
      tags: ["checklist", "ops", SEED_TAG],
      uam: snippet,
      stats: { views: 760, copies: 130, votesUp: 27 },
    },
  ];
}

async function seedOne(def: SeedDefinition) {
  const parsed = safeParseUamV1(def.uam);
  if (!parsed.success) {
    throw new Error(`Invalid UAM v1 for ${def.slug}: ${parsed.error.issues.map(i => i.message).join("; ")}`);
  }

  const targets = uniqueSorted(parsed.data.targets.map(t => t.targetId));
  if (targets.length === 0) {
    throw new Error(`Seed item ${def.slug} must include at least one targetId`);
  }

  const hasScopes = parsed.data.scopes.some(s => s.kind !== "global");
  if (!hasScopes) {
    throw new Error(`Seed item ${def.slug} must include at least one non-global scope`);
  }

  const tags = uniqueSorted([...def.tags, SEED_TAG]);

  const existing = await prisma.artifact.findUnique({
    where: { slug: def.slug },
    select: { id: true, userId: true, tags: true },
  });

  if (existing && existing.userId && !existing.tags.includes(SEED_TAG)) {
    console.warn(`[seed:demo] Skipping slug "${def.slug}" (owned artifact without "${SEED_TAG}" tag)`);
    return { slug: def.slug, action: "skipped" as const };
  }

  const artifact =
    existing === null
      ? await prisma.artifact.create({
          data: {
            slug: def.slug,
            type: def.type,
            title: def.title,
            description: def.description,
            visibility: Visibility.PUBLIC,
            tags,
            targets,
            hasScopes: true,
            lintGrade: "A",
            ...(def.stats ? def.stats : {}),
            versions: {
              create: {
                version: SEED_VERSION,
                uam: parsed.data as unknown as Prisma.InputJsonValue,
                message: "Seed demo artifact",
              },
            },
          },
          select: { id: true },
        })
      : await prisma.artifact.update({
          where: { id: existing.id },
          data: {
            type: def.type,
            title: def.title,
            description: def.description,
            visibility: Visibility.PUBLIC,
            tags,
            targets,
            hasScopes: true,
            lintGrade: "A",
          },
          select: { id: true },
        });

  const existingVersion = await prisma.artifactVersion.findFirst({
    where: { artifactId: artifact.id, version: SEED_VERSION },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  if (existingVersion) {
    await prisma.artifactVersion.update({
      where: { id: existingVersion.id },
      data: {
        uam: parsed.data as unknown as Prisma.InputJsonValue,
        message: "Seed demo artifact",
      },
    });
    return { slug: def.slug, action: "updated" as const };
  }

  await prisma.artifactVersion.create({
    data: {
      artifactId: artifact.id,
      version: SEED_VERSION,
      uam: parsed.data as unknown as Prisma.InputJsonValue,
      message: "Seed demo artifact",
    },
  });

  return { slug: def.slug, action: "created" as const };
}

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to run in production.");
  }
  if (!hasDatabaseEnv) {
    throw new Error("DATABASE_URL must be set (Postgres) and SKIP_DB must not be '1'.");
  }

  const defs = buildSeedDefinitions();
  const results = [];
  for (const def of defs) {
    results.push(await seedOne(def));
  }

  const counts = results.reduce(
    (acc, r) => {
      acc[r.action]++;
      return acc;
    },
    { created: 0, updated: 0, skipped: 0 } as Record<"created" | "updated" | "skipped", number>
  );

  console.log(`[seed:demo] done (created=${counts.created}, updated=${counts.updated}, skipped=${counts.skipped})`);
}

const isEntrypoint = process.argv[1] === fileURLToPath(import.meta.url);
if (isEntrypoint) {
  void main()
    .catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[seed:demo] ${message}`);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
