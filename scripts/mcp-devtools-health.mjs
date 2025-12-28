const url = process.env.MCP_HEALTH_URL ?? "http://localhost:3000";
const timeoutMs = Number(process.env.MCP_HEALTH_TIMEOUT ?? "2000");

const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

const formatMs = (value) => `${Math.round(value)}ms`;

const log = (message) => {
  process.stdout.write(`${message}\n`);
};

const logSection = (title) => {
  process.stdout.write(`\n${title}\n`);
};

try {
  const start = Date.now();
  const response = await fetch(url, {
    method: "HEAD",
    signal: controller.signal,
  });
  clearTimeout(timeoutId);

  const durationMs = Date.now() - start;
  const statusLine = `HTTP ${response.status} (${formatMs(durationMs)})`;

  if (response.ok) {
    log(`MCP health check OK: ${statusLine}`);
    log("Next: open a fresh DevTools MCP page and capture console/network.");
  } else {
    log(`MCP health check warning: ${statusLine}`);
    log("If the app is expected to be running, restart the dev server.");
  }

  logSection("Troubleshooting");
  log(`- Confirm the dev server: pnpm dev`);
  log(`- Retry with: MCP_HEALTH_URL=${url} MCP_HEALTH_TIMEOUT=${timeoutMs} node scripts/mcp-devtools-health.mjs`);
  log("- If MCP timeouts persist, restart the MCP bridge/agent.");
} catch (error) {
  clearTimeout(timeoutId);
  log(`MCP health check failed: ${error?.name ?? "Error"}`);
  log("Ensure the dev server is running and reachable.");
  log("Retry with: MCP_HEALTH_URL=http://localhost:3000 node scripts/mcp-devtools-health.mjs");
}
