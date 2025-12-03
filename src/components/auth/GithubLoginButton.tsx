"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";

type Props = {
  callbackUrl: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "lg" | "sm";
  disabled?: boolean;
  className?: string;
};

export function GithubLoginButton({
  callbackUrl,
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  className,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (disabled || loading) return;
    setLoading(true);
    await signIn("github", { callbackUrl });
    setLoading(false);
  }

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      size={size}
      disabled={disabled || loading}
      className={`whitespace-nowrap ${className ?? ""}`.trim()}
    >
      {loading ? "Redirecting…" : children}
    </Button>
  );
}
