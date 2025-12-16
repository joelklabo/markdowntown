'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export function ForkButton({ artifactId }: { artifactId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleFork = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/artifacts/fork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artifactId }),
      });

      if (!res.ok) throw new Error('Fork failed');
      
      const data = await res.json();
      router.push(`/workbench?id=${data.id}`);
    } catch (error) {
      console.error(error);
      alert('Failed to fork artifact. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Button variant="secondary" onClick={handleFork} disabled={loading}>
      {loading ? 'Forking...' : 'Fork / Edit'}
    </Button>
  );
}
