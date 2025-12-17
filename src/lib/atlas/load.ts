import fs from 'node:fs';
import path from 'node:path';
import { ZodError } from 'zod';
import { AtlasPlatformIdSchema, parsePlatformFacts } from './schema.ts';
import { parseAtlasCrosswalk } from './features.ts';
import type { AtlasCrosswalk } from './features.ts';
import type { AtlasPlatformId, PlatformFacts } from './types.ts';

export type AtlasLoadOptions = {
  atlasDir?: string;
};

function getAtlasDir(options?: AtlasLoadOptions): string {
  return options?.atlasDir ?? path.join(process.cwd(), 'atlas');
}

function formatZodError(error: ZodError): string {
  return error.issues
    .map(issue => {
      const at = issue.path.length ? issue.path.join('.') : '(root)';
      return `${at}: ${issue.message}`;
    })
    .join('\n');
}

function readUtf8File(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    const cause = error instanceof Error ? error.message : String(error);
    throw new Error(`[atlas] Failed to read file: ${filePath}\n${cause}`);
  }
}

function readJsonFile(filePath: string): unknown {
  const text = readUtf8File(filePath);
  try {
    return JSON.parse(text) as unknown;
  } catch (error) {
    const cause = error instanceof Error ? error.message : String(error);
    throw new Error(`[atlas] Invalid JSON in ${filePath}\n${cause}`);
  }
}

function assertSafePathSegment(segment: string, label: string): void {
  if (!/^[a-z0-9][a-z0-9-]*$/i.test(segment)) {
    throw new Error(`[atlas] Invalid ${label}: ${segment}`);
  }
}

function assertSafeFileName(fileName: string): void {
  if (!/^[a-z0-9][a-z0-9._-]*$/i.test(fileName)) {
    throw new Error(`[atlas] Invalid example filename: ${fileName}`);
  }
}

export function loadAtlasCrosswalk(options?: AtlasLoadOptions): AtlasCrosswalk {
  const atlasDir = getAtlasDir(options);
  const crosswalkPath = path.join(atlasDir, 'crosswalk.json');
  const raw = readJsonFile(crosswalkPath);

  try {
    return parseAtlasCrosswalk(raw);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error(`[atlas] Invalid crosswalk at ${crosswalkPath}\n${formatZodError(error)}`);
    }
    throw error;
  }
}

export function loadAtlasFacts(platformId: AtlasPlatformId, options?: AtlasLoadOptions): PlatformFacts {
  const atlasDir = getAtlasDir(options);
  const factsPath = path.join(atlasDir, 'facts', `${platformId}.json`);
  const raw = readJsonFile(factsPath);

  try {
    return parsePlatformFacts(raw);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error(`[atlas] Invalid facts for ${platformId} at ${factsPath}\n${formatZodError(error)}`);
    }
    throw error;
  }
}

export function listAtlasPlatforms(options?: AtlasLoadOptions): AtlasPlatformId[] {
  const atlasDir = getAtlasDir(options);
  const factsDir = path.join(atlasDir, 'facts');
  if (!fs.existsSync(factsDir)) return [];

  const fileNames = fs.readdirSync(factsDir);
  const platformIds: AtlasPlatformId[] = [];

  for (const fileName of fileNames) {
    if (!fileName.endsWith('.json')) continue;
    const baseName = path.basename(fileName, '.json');
    const parsed = AtlasPlatformIdSchema.safeParse(baseName);
    if (!parsed.success) {
      throw new Error(`[atlas] Unknown platformId "${baseName}" from file ${path.join(factsDir, fileName)}`);
    }
    platformIds.push(parsed.data);
  }

  platformIds.sort();
  return platformIds;
}

function parseSafePath(value: string, label: string): string[] {
  const segments = value.split('/').filter(Boolean);
  if (segments.length === 0) {
    throw new Error(`[atlas] Invalid ${label}: ${value}`);
  }
  for (const segment of segments) {
    assertSafePathSegment(segment, label);
  }
  return segments;
}

export type AtlasGuideKind = 'concepts' | 'recipes';

export function listAtlasGuideSlugs(kind: AtlasGuideKind, options?: AtlasLoadOptions): string[] {
  const atlasDir = getAtlasDir(options);
  const guidesDir = path.join(atlasDir, 'guides', kind);
  if (!fs.existsSync(guidesDir)) return [];

  const slugs: string[] = [];
  const fileNames = fs.readdirSync(guidesDir);

  for (const fileName of fileNames) {
    if (!fileName.endsWith('.mdx')) continue;
    const fullPath = path.join(guidesDir, fileName);
    if (!fs.statSync(fullPath).isFile()) continue;
    const slug = path.basename(fileName, '.mdx');
    assertSafePathSegment(slug, 'guide slug');
    slugs.push(slug);
  }

  slugs.sort();
  return slugs;
}

export function loadAtlasGuideMdx(guidePath: string, options?: AtlasLoadOptions): string {
  const segments = parseSafePath(guidePath, 'guide path');
  const atlasDir = getAtlasDir(options);
  const filePath = path.join(atlasDir, 'guides', ...segments) + '.mdx';
  return readUtf8File(filePath);
}

export function loadAtlasExample(
  platformId: AtlasPlatformId,
  fileName: string,
  options?: AtlasLoadOptions,
): string {
  assertSafeFileName(fileName);
  const atlasDir = getAtlasDir(options);
  const examplePath = path.join(atlasDir, 'examples', platformId, fileName);
  return readUtf8File(examplePath);
}

export type AtlasExample = {
  fileName: string;
  contents: string;
};

export function listAtlasExamples(platformId: AtlasPlatformId, options?: AtlasLoadOptions): AtlasExample[] {
  const atlasDir = getAtlasDir(options);
  const examplesDir = path.join(atlasDir, 'examples', platformId);
  if (!fs.existsSync(examplesDir)) return [];

  const out: AtlasExample[] = [];
  const fileNames = fs.readdirSync(examplesDir);

  for (const fileName of fileNames) {
    if (fileName.startsWith('.')) continue;
    const fullPath = path.join(examplesDir, fileName);
    if (!fs.statSync(fullPath).isFile()) continue;
    assertSafeFileName(fileName);
    out.push({ fileName, contents: readUtf8File(fullPath) });
  }

  out.sort((a, b) => a.fileName.localeCompare(b.fileName));
  return out;
}
