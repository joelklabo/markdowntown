export type SimulatorToolId = 'github-copilot' | 'claude-code' | 'gemini-cli' | 'codex-cli';

export type RepoTreeFile = {
  path: string;
  content: string;
};

export type RepoTree = {
  files: RepoTreeFile[];
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
