import type {
  RepoTree,
  SimulationInput,
  SimulatorInsightPattern,
  SimulatorInsights,
  SimulatorToolId,
} from './types.ts';

type TreeIndex = {
  has: (filePath: string) => boolean;
  listPaths: () => string[];
};

type PatternDefinition = SimulatorInsightPattern & {
  match: (index: TreeIndex, paths: string[]) => string[];
};

function normalizePath(value: string): string {
  const normalized = value.replace(/\\/g, '/').replace(/^\.\/+/, '').replace(/\/+$/, '');
  if (!normalized || normalized === '.') return '';
  return normalized;
}

function buildIndex(tree: RepoTree): TreeIndex {
  const paths = new Set<string>();

  for (const file of tree.files) {
    const normalized = normalizePath(file.path);
    if (!normalized) continue;
    paths.add(normalized);
  }

  return {
    has: (filePath: string) => paths.has(normalizePath(filePath)),
    listPaths: () => Array.from(paths).sort(),
  };
}

function ancestorDirs(cwd: string): string[] {
  const normalized = normalizePath(cwd);
  const parts = normalized ? normalized.split('/') : [];
  const dirs: string[] = [''];
  let current = '';
  for (const part of parts) {
    current = current ? `${current}/${part}` : part;
    dirs.push(current);
  }
  return dirs;
}

function joinDirFile(dir: string, fileName: string): string {
  return dir ? `${dir}/${fileName}` : fileName;
}

function uniqueOrdered(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    if (seen.has(item)) continue;
    seen.add(item);
    out.push(item);
  }
  return out;
}

function exactPattern(id: string, label: string, path: string): PatternDefinition {
  return {
    id,
    label,
    pattern: path,
    match: (index) => (index.has(path) ? [path] : []),
  };
}

function prefixPattern(
  id: string,
  label: string,
  pattern: string,
  prefix: string,
  suffix?: string,
): PatternDefinition {
  return {
    id,
    label,
    pattern,
    match: (_index, paths) =>
      paths.filter((path) => path.startsWith(prefix) && (!suffix || path.endsWith(suffix))),
  };
}

function buildResult(
  tool: SimulatorToolId,
  patterns: PatternDefinition[],
  precedenceNotes: string[],
  index: TreeIndex,
): SimulatorInsights {
  const paths = index.listPaths();
  const found: string[] = [];
  const missing: SimulatorInsightPattern[] = [];

  for (const pattern of patterns) {
    const matches = pattern.match(index, paths);
    if (matches.length === 0) {
      missing.push({ id: pattern.id, label: pattern.label, pattern: pattern.pattern });
      continue;
    }
    found.push(...matches);
  }

  return {
    tool,
    expectedPatterns: patterns.map(({ id, label, pattern }) => ({ id, label, pattern })),
    foundFiles: uniqueOrdered(found),
    missingFiles: missing,
    precedenceNotes,
  };
}

function gitHubCopilotInsights(index: TreeIndex): SimulatorInsights {
  const patterns = [
    exactPattern(
      'github-copilot.repo',
      'Repo instructions',
      '.github/copilot-instructions.md',
    ),
    prefixPattern(
      'github-copilot.scoped',
      'Scoped instructions',
      '.github/instructions/*.instructions.md',
      '.github/instructions/',
      '.instructions.md',
    ),
  ];

  return buildResult(
    'github-copilot',
    patterns,
    ['More specific scoped instructions take precedence over repo-wide instructions.'],
    index,
  );
}

function copilotCliInsights(index: TreeIndex): SimulatorInsights {
  const patterns = [
    exactPattern(
      'copilot-cli.repo',
      'Repo instructions',
      '.github/copilot-instructions.md',
    ),
    prefixPattern(
      'copilot-cli.scoped',
      'Scoped instructions',
      '.github/copilot-instructions/**/*.instructions.md',
      '.github/copilot-instructions/',
      '.instructions.md',
    ),
    prefixPattern(
      'copilot-cli.agents',
      'Agent profiles',
      '.github/agents/*',
      '.github/agents/',
    ),
  ];

  return buildResult(
    'copilot-cli',
    patterns,
    [
      'Scoped instruction files take precedence over repo-wide instructions.',
      'When agent profile names conflict, higher-precedence scopes win.',
    ],
    index,
  );
}

function codexCliInsights(index: TreeIndex, cwd: string): SimulatorInsights {
  const patterns: PatternDefinition[] = [];

  for (const dir of ancestorDirs(cwd)) {
    const labelSuffix = dir ? `(${dir})` : '(root)';
    patterns.push(
      exactPattern(
        `codex-cli.agents.${dir || 'root'}`,
        `Directory instructions ${labelSuffix}`,
        joinDirFile(dir, 'AGENTS.md'),
      ),
    );
    patterns.push(
      exactPattern(
        `codex-cli.override.${dir || 'root'}`,
        `Directory override ${labelSuffix}`,
        joinDirFile(dir, 'AGENTS.override.md'),
      ),
    );
  }

  return buildResult(
    'codex-cli',
    patterns,
    [
      'AGENTS.override.md overrides AGENTS.md in the same directory.',
      'Instructions accumulate from the repo root to the cwd; deeper directories take precedence.',
    ],
    index,
  );
}

function claudeCodeInsights(index: TreeIndex, cwd: string): SimulatorInsights {
  const patterns: PatternDefinition[] = [];

  for (const dir of ancestorDirs(cwd)) {
    const labelSuffix = dir ? `(${dir})` : '(root)';
    patterns.push(
      exactPattern(
        `claude-code.memory.${dir || 'root'}`,
        `Directory memory ${labelSuffix}`,
        joinDirFile(dir, 'CLAUDE.md'),
      ),
    );
  }

  return buildResult(
    'claude-code',
    patterns,
    ['More specific CLAUDE.md files (closer to the cwd) take precedence.'],
    index,
  );
}

function geminiCliInsights(index: TreeIndex, cwd: string): SimulatorInsights {
  const patterns: PatternDefinition[] = [];

  for (const dir of ancestorDirs(cwd)) {
    const labelSuffix = dir ? `(${dir})` : '(root)';
    patterns.push(
      exactPattern(
        `gemini-cli.memory.${dir || 'root'}`,
        `Directory memory ${labelSuffix}`,
        joinDirFile(dir, 'GEMINI.md'),
      ),
    );
  }

  return buildResult(
    'gemini-cli',
    patterns,
    ['More specific GEMINI.md files (closer to the cwd) take precedence.'],
    index,
  );
}

export function computeSimulatorInsights({ tool, tree, cwd }: SimulationInput): SimulatorInsights {
  const index = buildIndex(tree);

  if (tool === 'github-copilot') {
    return gitHubCopilotInsights(index);
  }
  if (tool === 'copilot-cli') {
    return copilotCliInsights(index);
  }
  if (tool === 'codex-cli') {
    return codexCliInsights(index, cwd);
  }
  if (tool === 'claude-code') {
    return claudeCodeInsights(index, cwd);
  }
  if (tool === 'gemini-cli') {
    return geminiCliInsights(index, cwd);
  }

  return buildResult(tool, [], [], index);
}
