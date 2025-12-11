"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogOverlay, DialogTitle } from "@radix-ui/react-dialog";
import { Input } from "@/components/ui/Input";
import { cn, interactiveBase } from "@/lib/cn";
import { track } from "@/lib/analytics";
import { useTheme } from "@/providers/ThemeProvider";

export const COMMAND_PALETTE_OPEN_EVENT = "mdt:command-palette-open";

type CommandItem = {
  label: string;
  hint?: string;
  action: () => void;
  group: "Go to" | "Templates" | "Snippets" | "Files" | "Actions";
};

type PaletteProps = {
  suggestions?: CommandItem[];
};

export function CommandPalette({ suggestions = [] }: PaletteProps) {
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);

  useEffect(() => {
    function handleOpen(event: Event) {
      const detail = (event as CustomEvent<{ origin?: string }>).detail;
      setOpen(true);
      setHighlight(0);
      setQuery("");
      track("command_palette_open", { origin: detail?.origin ?? "entry_point" });
    }

    window.addEventListener(COMMAND_PALETTE_OPEN_EVENT, handleOpen as EventListener);
    return () => window.removeEventListener(COMMAND_PALETTE_OPEN_EVENT, handleOpen as EventListener);
  }, []);

  const commands = useMemo(() => {
    const baseCommands: CommandItem[] = [
      { label: "Go to home", action: () => router.push("/"), group: "Go to" },
      { label: "Browse library", action: () => router.push("/browse"), group: "Go to", hint: "⌘B" },
      { label: "Open builder", action: () => router.push("/builder"), group: "Go to", hint: "⌘Shift+B" },
      { label: "View templates", action: () => router.push("/templates"), group: "Templates" },
      { label: "Docs", action: () => router.push("/docs"), group: "Go to" },
      { label: theme === "dark" ? "Switch to light mode" : "Switch to dark mode", action: toggle, group: "Actions", hint: "⌘L" },
      { label: "Open search", action: () => router.push("/browse"), group: "Actions", hint: "/" },
    ];
    const q = query.trim().toLowerCase();
    const merged = [...suggestions, ...baseCommands];
    if (!q) return merged;
    return merged.filter((cmd) => cmd.label.toLowerCase().includes(q));
  }, [query, suggestions, router, theme, toggle]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMac = /mac/i.test(navigator.userAgent);
      const cmdK = (isMac && e.metaKey && e.key.toLowerCase() === "k") || (!isMac && e.ctrlKey && e.key.toLowerCase() === "k");
      if (cmdK) {
        e.preventDefault();
        setOpen(true);
        setHighlight(0);
        track("command_palette_open", { origin: "keyboard" });
        return;
      }
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlight((h) => Math.min(h + 1, commands.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlight((h) => Math.max(h - 1, 0));
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const safeIndex = Math.min(highlight, Math.max(commands.length - 1, 0));
        const cmd = commands[safeIndex];
        if (cmd) {
          cmd.action();
          track("command_palette_run", { label: cmd.label });
          setOpen(false);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, commands, highlight]);

  const grouped = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    commands.forEach((cmd) => {
      groups[cmd.group] = groups[cmd.group] ? [...groups[cmd.group], cmd] : [cmd];
    });
    return groups;
  }, [commands]);

  return (
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogOverlay className="fixed inset-0 z-50 bg-[color:var(--mdt-color-overlay)] backdrop-blur-sm" />
      <DialogContent
        className="fixed left-1/2 top-24 z-50 w-[90vw] max-w-2xl -translate-x-1/2 rounded-mdt-lg border border-mdt-border bg-mdt-surface-raised p-mdt-4 shadow-mdt-lg"
        aria-label="Command palette"
      >
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <Input
          data-cmd-input
          autoFocus
          placeholder="Type a command or search…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="mt-mdt-3 max-h-[60vh] overflow-auto rounded-mdt-md border border-mdt-border bg-mdt-surface-subtle">
          {commands.length === 0 && (
            <div className="p-mdt-4 text-body-sm text-mdt-muted">No matches.</div>
          )}
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group} className="border-b border-mdt-border last:border-none">
              <div className="px-mdt-3 py-mdt-2 text-caption text-mdt-muted">{group}</div>
              {items.map((item, idx) => {
                const absoluteIndex = commands.indexOf(item);
                const currentHighlight = Math.min(highlight, Math.max(commands.length - 1, 0));
                const active = absoluteIndex === currentHighlight;
                return (
                  <button
                    key={item.label + idx}
                    type="button"
                    onMouseEnter={() => setHighlight(absoluteIndex)}
                    onClick={() => {
                      item.action();
                      track("command_palette_run", { label: item.label });
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between px-mdt-3 py-mdt-2 text-left text-body-sm",
                      interactiveBase,
                      active
                        ? "bg-[color:var(--mdt-color-surface-strong)] text-mdt-text shadow-mdt-sm"
                        : "text-mdt-text hover:bg-[color:var(--mdt-color-surface-subtle)]"
                    )}
                  >
                    <span>{item.label}</span>
                    {item.hint && <span className="text-caption text-mdt-muted">{item.hint}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="mt-mdt-3 flex justify-between text-caption text-mdt-muted">
          <span>Use ↑ ↓ to navigate, Enter to run</span>
          <span>Esc to close</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
