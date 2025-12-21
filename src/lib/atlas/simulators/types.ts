export type SimulatorToolId = 'github-copilot' | 'copilot-cli' | 'claude-code' | 'gemini-cli' | 'codex-cli';

export type RepoTreeFile = {
  path: string;
  content: string;
};

export type RepoTree = {
  files: RepoTreeFile[];
};

export type RepoScanMeta = {
  totalFiles: number;
  matchedFiles: number;
  truncated: boolean;
};

export type RepoScanResult = RepoScanMeta & {
  tree: RepoTree;
};

export type SimulationInput = {
  tool: SimulatorToolId;
  tree: RepoTree;
  cwd: string;
};

export type LoadedFile = {
  path: string;
  reason: string;
};

export type SimulationWarning = {
  code: string;
  message: string;
};

export type SimulationResult = {
  loaded: LoadedFile[];
  warnings: SimulationWarning[];
};

export type SimulatorInsightPattern = {
  id: string;
  label: string;
  pattern: string;
};

export type SimulatorInsights = {
  tool: SimulatorToolId;
  expectedPatterns: SimulatorInsightPattern[];
  foundFiles: string[];
  missingFiles: SimulatorInsightPattern[];
  precedenceNotes: string[];
};

export type InstructionDiagnosticSeverity = 'error' | 'warning' | 'info';

export type InstructionDiagnostic = {
  code: string;
  severity: InstructionDiagnosticSeverity;
  message: string;
  suggestion?: string;
  path?: string;
  expectedPath?: string;
};

export type InstructionDiagnostics = {
  tool: SimulatorToolId;
  diagnostics: InstructionDiagnostic[];
};
