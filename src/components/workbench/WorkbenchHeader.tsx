'use client';

import React, { useState } from 'react';
import { useWorkbenchStore } from '@/hooks/useWorkbenchStore';
import { Button } from '@/components/ui/Button';
import { useSession } from 'next-auth/react';
import { Input } from '@/components/ui/Input';
import { COMMAND_PALETTE_OPEN_EVENT } from '@/components/CommandPalette';
import { track } from '@/lib/analytics';

export function WorkbenchHeader() {
  const { data: session } = useSession();
  const title = useWorkbenchStore(s => s.title);
  const autosaveStatus = useWorkbenchStore(s => s.autosaveStatus);
  const lastSavedAt = useWorkbenchStore(s => s.lastSavedAt);
  const cloudSaveStatus = useWorkbenchStore(s => s.cloudSaveStatus);
  const cloudLastSavedAt = useWorkbenchStore(s => s.cloudLastSavedAt);
  const saveArtifact = useWorkbenchStore(s => s.saveArtifact);
  
  const setTitle = useWorkbenchStore(s => s.setTitle);

  const [saving, setSaving] = useState(false);

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
    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
       <div className="flex items-center gap-2">
         <Input 
           value={title} 
           onChange={(e) => setTitle(e.target.value)} 
           className="font-bold border-transparent hover:border-gray-200 focus:border-blue-500 w-64 h-8 py-1"
           aria-label="Agent Title"
         />
       </div>
       <div className="flex gap-2 items-center">
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
         <div className="text-xs text-gray-500 tabular-nums leading-tight">
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
         {!session && <span className="text-xs text-red-500">Sign in to save</span>}
       </div>
    </div>
  );
}
