"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";

type Props = {
  password: string;
  callbackUrl?: string;
};

export function DemoLoginButton({ password, callbackUrl = "/" }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    const res = await signIn("demo", {
      password,
      callbackUrl,
      redirect: true,
    });
    if (res?.error) {
      setError("Demo sign-in failed. Check the password and try again.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2 w-full">
      <Button className="w-full" onClick={handleClick} disabled={loading}>
        {loading ? "Signing in…" : "Sign in with demo account"}
      </Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-mdt-muted">
        Uses a local demo user; no GitHub account required.
      </p>
    </div>
  );
}
