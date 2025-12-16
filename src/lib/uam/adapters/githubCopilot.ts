import { Adapter, CompiledFile } from '../adapters';
import { UniversalAgentDefinition } from '../types';

export const githubCopilotAdapter: Adapter = {
  id: 'github-copilot',
  name: 'GitHub Copilot',
  description: 'Compiles to .github/copilot-instructions.md.',
  compile: (def: UniversalAgentDefinition) => {
    const warnings: string[] = [];
    const parts: string[] = [];

    // Helper to check for glob
    const isGlob = (s: string) => s.includes('*') || s.includes('?') || s.includes('[');

    for (const block of def.blocks) {
      const targetScopes = block.scopes && block.scopes.length > 0 ? block.scopes : ['root'];

      for (const scope of targetScopes) {
        if (scope === 'root' || scope === '.' || scope === '/' || scope === '') {
          parts.push(block.content);
        } else {
          // Check for glob enforcement
          if (!isGlob(scope)) {
            warnings.push(`Block '${block.id}' has scope '${scope}' which is not a glob pattern. GitHub Copilot adapter requires glob patterns for scoped blocks.`);
            // We still include it, but maybe with the non-glob scope?
            // "Enforce" usually means error or warn. The task says "warns on missing globs".
            // I'll include it with the header anyway, but the warning is key.
          }
          parts.push(`For files matching \`${scope}\`:\n\n${block.content}`);
        }
      }
    }

    const files: CompiledFile[] = [
      {
        path: '.github/copilot-instructions.md',
        content: parts.join('\n\n---\n\n'), // Separator for clarity
      },
    ];

    return { files, warnings };
  }
};
