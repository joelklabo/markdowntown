import type { Adapter, CompiledFile } from "./types";
import type { UamScopeV1, UamTargetV1, UamV1 } from "../uam/uamTypes";

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
  return slug.length > 0 ? slug : "rules";
}

function normalizeDir(dir: string): string {
  return dir.replace(/\\/g, "/").trim().replace(/^\.\/+/, "").replace(/\/+$/, "");
}

function scopeBaseName(scope: Extract<UamScopeV1, { kind: "dir" | "glob" }>): string {
  const named = scope.name?.trim();
  if (named && named.length > 0) return slugify(named);

  if (scope.kind === "dir") {
    const normalized = normalizeDir(scope.dir);
    return slugify(normalized.length > 0 ? normalized : "root");
  }

  return slugify(scope.patterns.join(" "));
}

function scopeHeader(scope: Extract<UamScopeV1, { kind: "dir" | "glob" }>): string {
  if (scope.kind === "dir") {
    const dir = normalizeDir(scope.dir);
    return `# Rules for ${dir.length > 0 ? dir : "root"}`;
  }
  const patterns = scope.patterns.join(", ");
  return `# Rules for ${patterns.length > 0 ? patterns : "glob"}`;
}

type SkillExportConfig = {
  exportAll: boolean;
  allowList: string[] | null;
};

function parseSkillExportConfig(target?: UamTargetV1): SkillExportConfig {
  const options = (target?.options ?? {}) as Record<string, unknown>;
  const exportAll = options.exportSkills === true;

  const allowListRaw = options.skills ?? options.exportSkills;
  if (Array.isArray(allowListRaw)) {
    const ids = allowListRaw.map((v) => String(v).trim()).filter(Boolean);
    return { exportAll: false, allowList: ids.length > 0 ? ids : null };
  }

  return { exportAll, allowList: null };
}

function renderSkillMarkdown(capability: { id: string; title?: string; description?: string; params?: Record<string, unknown> }) {
  const title = capability.title?.trim();
  const heading = `# ${title && title.length > 0 ? title : capability.id}`;
  const desc = capability.description?.trim();
  const parts: string[] = [heading];
  if (desc && desc.length > 0) parts.push(desc);
  if (capability.params && Object.keys(capability.params).length > 0) {
    parts.push("```json\n" + JSON.stringify(capability.params, null, 2) + "\n```");
  }
  return parts.join("\n\n").trimEnd() + "\n";
}

export const claudeCodeAdapter: Adapter = {
  id: "claude-code",
  version: "1",
  label: "Claude Code",
  description: "Exports UAM v1 to CLAUDE.md and .claude rule/skill files.",
  compile: (uam: UamV1, target?: UamTargetV1) => {
    const warnings: string[] = [];
    const info: string[] = [];
    const files: CompiledFile[] = [];

    const scopeById = new Map(uam.scopes.map((s) => [s.id, s] as const));

    const globalParts: string[] = [];
    const blocksByScopeId = new Map<string, string[]>();

    for (const block of uam.blocks) {
      const scope = scopeById.get(block.scopeId);
      if (!scope) {
        warnings.push(`Block '${block.id}' references unknown scopeId '${block.scopeId}'. Skipped.`);
        continue;
      }

      if (scope.kind === "global") {
        globalParts.push(block.body.trimEnd());
        continue;
      }

      const parts = blocksByScopeId.get(scope.id) ?? [];
      parts.push(block.body.trimEnd());
      blocksByScopeId.set(scope.id, parts);
    }

    if (globalParts.length > 0) {
      files.push({ path: "CLAUDE.md", content: globalParts.join("\n\n---\n\n").trimEnd() + "\n" });
    }

    const scoped = Array.from(blocksByScopeId.entries())
      .map(([scopeId, parts]) => ({ scopeId, parts, scope: scopeById.get(scopeId) }))
      .filter((x): x is { scopeId: string; parts: string[]; scope: Extract<UamScopeV1, { kind: "dir" | "glob" }> } => {
        if (!x.scope) return false;
        return x.scope.kind === "dir" || x.scope.kind === "glob";
      })
      .map((x) => ({ ...x, baseName: scopeBaseName(x.scope) }))
      .sort((a, b) => a.baseName.localeCompare(b.baseName) || a.scopeId.localeCompare(b.scopeId));

    const nameCounts = new Map<string, number>();
    for (const entry of scoped) {
      const count = (nameCounts.get(entry.baseName) ?? 0) + 1;
      nameCounts.set(entry.baseName, count);
      const fileName = count === 1 ? entry.baseName : `${entry.baseName}-${count}`;
      files.push({
        path: `.claude/rules/${fileName}.md`,
        content: `${scopeHeader(entry.scope)}\n\n${entry.parts.join("\n\n---\n\n").trimEnd()}\n`,
      });
    }

    const { exportAll, allowList } = parseSkillExportConfig(target);
    if (exportAll || allowList) {
      const requestedIds = allowList ?? uam.capabilities.map((c) => c.id);
      const capabilityById = new Map(uam.capabilities.map((c) => [c.id, c] as const));
      for (const id of requestedIds) {
        const cap = capabilityById.get(id);
        if (!cap) {
          warnings.push(`Unknown skill capability id '${id}'. Skipped.`);
          continue;
        }
        const dir = slugify(cap.id);
        files.push({
          path: `.claude/skills/${dir}/SKILL.md`,
          content: renderSkillMarkdown(cap),
        });
      }
    }

    files.sort((a, b) => a.path.localeCompare(b.path));
    return { files, warnings, info };
  },
};
