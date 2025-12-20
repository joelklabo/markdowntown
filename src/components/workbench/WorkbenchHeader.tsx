'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useWorkbenchStore, type ArtifactVisibility } from '@/hooks/useWorkbenchStore';
import { Button } from '@/components/ui/Button';
import { useSession } from 'next-auth/react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { COMMAND_PALETTE_OPEN_EVENT } from '@/components/CommandPalette';
import { track } from '@/lib/analytics';

export function WorkbenchHeader() {
  const { data: session } = useSession();
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
    <div className="flex items-center justify-between border-b border-mdt-border bg-mdt-surface px-mdt-4 py-mdt-3">
      <div className="flex items-center gap-mdt-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          size="sm"
          className="w-64 font-semibold"
          aria-label="Agent Title"
        />
        <Badge tone={visibilityBadge.tone} aria-label={`Visibility: ${visibilityBadge.label}`}>
          {visibilityBadge.label}
        </Badge>
      </div>
      <div className="flex items-center gap-mdt-2">
        <Select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as ArtifactVisibility)}
          aria-label="Visibility"
          size="sm"
          className="w-32"
        >
          <option value="PRIVATE">Private</option>
          <option value="UNLISTED">Unlisted</option>
          <option value="PUBLIC">Public</option>
        </Select>
        <Input
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
          className="w-56"
        />
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            window.dispatchEvent(new CustomEvent(COMMAND_PALETTE_OPEN_EVENT, { detail: { origin: 'workbench_header' } }));
          }}
          title="Command palette (⌘K)"
        >
          ⌘K
        </Button>
        <div className="text-caption text-mdt-muted tabular-nums leading-tight">
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
        <Button size="sm" onClick={handleSave} disabled={saving || cloudSaveStatus === 'saving' || !session}>
          {saving || cloudSaveStatus === 'saving' ? 'Saving...' : 'Save'}
        </Button>
        {!session && <span className="text-caption text-[color:var(--mdt-color-danger)]">Sign in to save</span>}
      </div>
    </div>
  );
}
