export type SampleItemType = "snippet" | "template" | "file";

export type SampleItem = {
  id: string;
  slug?: string;
  title: string;
  description: string;
  tags: string[];
  stats: {
    copies: number;
    views: number;
    votes: number;
  };
  type: SampleItemType;
  badge?: "new" | "trending" | "staff";
};

export const sampleItems: SampleItem[] = [
  {
    id: "sys-tone",
    title: "System tone: concise teammate",
    description: "Sets assistant tone to concise, friendly teammate with numbered lists.",
    tags: ["system", "style", "concise"],
    stats: { copies: 1280, views: 4200, votes: 96 },
    type: "snippet",
    badge: "trending",
  },
  {
    id: "tools-codex",
    title: "Tools: Codex CLI + apply_patch",
    description: "Defines tool usage rules for Codex CLI repos, including apply_patch safety.",
    tags: ["tools", "cli", "safety"],
    stats: { copies: 860, views: 3100, votes: 71 },
    type: "snippet",
  },
  {
    id: "agents-template-basic",
    title: "agents.md template: repo-aware reviewer",
    description: "Template with placeholders for repo name, style, and risk areas; includes review checklist.",
    tags: ["template", "review", "placeholders"],
    stats: { copies: 640, views: 1800, votes: 54 },
    type: "template",
    badge: "staff",
  },
  {
    id: "agents-file-langs",
    title: "Agents file: polyglot project starter",
    description: "Full agents.md stitched from system + style + tools + testing sections for multi-language repos.",
    tags: ["file", "starter", "multi-lang"],
    stats: { copies: 430, views: 1400, votes: 33 },
    type: "file",
    badge: "new",
  },
  {
    id: "template-bug-hunt",
    title: "Template: bug-hunt session",
    description: "Form-driven template for reproducing bugs with environment, steps, and expected/actual fields.",
    tags: ["template", "qa", "form"],
    stats: { copies: 520, views: 1500, votes: 40 },
    type: "template",
  },
  {
    id: "snippet-post-deploy",
    title: "Snippet: post-deploy smoke list",
    description: "Markdown checklist for post-deploy validation across API, UI, and logs.",
    tags: ["snippet", "checklist", "ops"],
    stats: { copies: 780, views: 2000, votes: 58 },
    type: "snippet",
  },
];

export const sampleTags = [
  { tag: "system", count: 120 },
  { tag: "templates", count: 110 },
  { tag: "tools", count: 95 },
  { tag: "style", count: 90 },
  { tag: "qa", count: 80 },
  { tag: "cli", count: 75 },
  { tag: "agents", count: 70 },
  { tag: "checklist", count: 65 },
  { tag: "review", count: 60 },
];
