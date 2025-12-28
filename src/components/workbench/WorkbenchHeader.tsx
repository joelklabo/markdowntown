'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useWorkbenchStore, type ArtifactVisibility } from '@/hooks/useWorkbenchStore';
import { Button } from '@/components/ui/Button';
import type { Session } from 'next-auth';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Text } from '@/components/ui/Text';
import { COMMAND_PALETTE_OPEN_EVENT } from '@/components/CommandPalette';
import { track } from '@/lib/analytics';

type WorkbenchHeaderProps = {
  session: Session | null;
};

export function WorkbenchHeader({ session }: WorkbenchHeaderProps) {
  const artifactId = useWorkbenchStore(s => s.id);
  const title = useWorkbenchStore(s => s.title);
  const autosaveStatus = useWorkbenchStore(s => s.autosaveStatus);
  const lastSavedAt = useWorkbenchStore(s => s.lastSavedAt);
  const cloudSaveStatus = useWorkbenchStore(s => s.cloudSaveStatus);
  const cloudLastSavedAt = useWorkbenchStore(s => s.cloudLastSavedAt);
  const saveArtifact = useWorkbenchStore(s => s.saveArtifact);

  const setTitle = useWorkbenchStore(s => s.setTitle);
  const visibility = useWorkbenchStore(s => s.visibility);
  const setVisibility = useWorkbenchStore(s => s.setVisibility);
  const tags = useWorkbenchStore(s => s.tags);
  const setTags = useWorkbenchStore(s => s.setTags);

  const [saving, setSaving] = useState(false);
  const [tagsDraft, setTagsDraft] = useState(() => tags.join(', '));
  const [tagsFocused, setTagsFocused] = useState(false);

  useEffect(() => {
    if (tagsFocused) return;
    setTagsDraft(tags.join(', '));
  }, [tags, tagsFocused, artifactId]);

  const visibilityBadge = useMemo(() => {
    if (visibility === 'PUBLIC') return { label: 'Public', tone: 'success' as const };
    if (visibility === 'UNLISTED') return { label: 'Unlisted', tone: 'info' as const };
    return { label: 'Draft', tone: 'warning' as const };
  }, [visibility]);

  const parseTags = (value: string) =>
    value
      .split(',')
      .map(v => v.trim())
      .filter(Boolean);

  const handleSave = async () => {
    if (!session) return;
    setSaving(true);
    try {
      const id = await saveArtifact();
      if (id) track('workbench_save_artifact', { id });
      else track('workbench_save_artifact_failed', {});
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border-b border-mdt-border bg-mdt-surface">
      <div className="flex flex-col gap-mdt-4 px-mdt-4 py-mdt-4 md:flex-row md:items-center md:justify-between md:px-mdt-6">
        <div className="flex flex-col gap-mdt-1">
          <div className="flex flex-col gap-mdt-2 sm:flex-row sm:flex-wrap sm:items-center">
            <label htmlFor="workbench-title" className="sr-only">
              Agent Title
            </label>
            <Input
              id="workbench-title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              size="sm"
              className="w-full font-semibold sm:w-72 md:w-80"
            />
            <Badge
              tone={visibilityBadge.tone}
              aria-label={`Visibility: ${visibilityBadge.label}`}
              className="uppercase tracking-wide"
            >
              {visibilityBadge.label}
            </Badge>
          </div>
          <Text size="caption" tone="muted">
            Build then export.
          </Text>
        </div>

        <div className="flex flex-col gap-mdt-4 md:flex-row md:flex-wrap md:items-center md:justify-end">
          <div className="flex flex-1 flex-wrap items-center gap-mdt-2">
            <label htmlFor="workbench-visibility" className="sr-only">
              Visibility
            </label>
            <Select
              id="workbench-visibility"
              name="visibility"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as ArtifactVisibility)}
              size="sm"
              className="w-full sm:w-36"
            >
              <option value="PRIVATE">Private</option>
              <option value="UNLISTED">Unlisted</option>
              <option value="PUBLIC">Public</option>
            </Select>
            <label htmlFor="workbench-tags" className="sr-only">
              Tags
            </label>
            <Input
              id="workbench-tags"
              name="tags"
              value={tagsDraft}
              onChange={(e) => {
                const value = e.target.value;
                setTagsDraft(value);
                setTags(parseTags(value));
              }}
              onFocus={() => setTagsFocused(true)}
              onBlur={() => setTagsFocused(false)}
              placeholder="Tags (comma-separated)"
              aria-label="Tags"
              size="sm"
              className="w-full sm:w-52 md:w-64"
            />
            <Button
              size="sm"
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent(COMMAND_PALETTE_OPEN_EVENT, { detail: { origin: 'workbench_header' } })
                );
              }}
              title="Command palette (⌘K)"
            >
              ⌘K
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-mdt-3 md:justify-end">
            <div className="min-w-[180px] rounded-mdt-md border border-mdt-border bg-mdt-surface-subtle px-mdt-3 py-mdt-2 text-[11px] text-mdt-muted tabular-nums leading-snug">
              <div>
                {autosaveStatus === 'saving'
                  ? 'Draft: saving…'
                  : autosaveStatus === 'saved'
                    ? `Draft: saved${lastSavedAt ? ` · ${new Date(lastSavedAt).toLocaleTimeString()}` : ''}`
                    : autosaveStatus === 'error'
                      ? 'Draft: error'
                      : 'Draft: idle'}
              </div>
              <div>
                {!session
                  ? 'Cloud: sign in'
                  : cloudSaveStatus === 'saving'
                    ? 'Cloud: saving…'
                    : cloudSaveStatus === 'saved'
                      ? `Cloud: saved${cloudLastSavedAt ? ` · ${new Date(cloudLastSavedAt).toLocaleTimeString()}` : ''}`
                      : cloudSaveStatus === 'error'
                        ? 'Cloud: error'
                        : 'Cloud: idle'}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-mdt-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleSave}
                disabled={saving || cloudSaveStatus === 'saving' || !session}
              >
                {saving || cloudSaveStatus === 'saving' ? 'Saving...' : 'Save'}
              </Button>
              {!session && (
                <span className="text-caption text-[color:var(--mdt-color-danger)]">Sign in to save</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
