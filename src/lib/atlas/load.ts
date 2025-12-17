import fs from 'node:fs';
import path from 'node:path';
import { ZodError } from 'zod';
import { AtlasPlatformIdSchema, parsePlatformFacts } from './schema';
import { parseAtlasCrosswalk } from './features';
import type { AtlasCrosswalk } from './features';
import type { AtlasPlatformId, PlatformFacts } from './types';

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

export function loadAtlasGuideMdx(slug: string, options?: AtlasLoadOptions): string {
  assertSafePathSegment(slug, 'guide slug');
  const atlasDir = getAtlasDir(options);
  const guidePath = path.join(atlasDir, 'guides', `${slug}.mdx`);
  return readUtf8File(guidePath);
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
