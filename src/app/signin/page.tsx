import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DemoLoginButton } from "@/components/auth/DemoLoginButton";
import { GithubLoginButton } from "@/components/auth/GithubLoginButton";

export const metadata = {
  title: "Sign in · MarkdownTown",
};

const githubConfigured = Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
const demoLoginEnabled = process.env.DEMO_LOGIN_DISABLED !== "true";
const demoPassword = process.env.DEMO_LOGIN_PASSWORD ?? "demo-login";

export default async function SignInPage({
  searchParams,
}: {
  searchParams?: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const callbackUrl = params.callbackUrl || "/";
  const error = params.error;

  return (
    <div className="min-h-screen bg-mdt-bg-soft text-mdt-text">
      <header className="border-b border-mdt-border bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <BrandLogo />
          <Button asChild size="sm">
            <Link href="/">Back home</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-4 py-12 md:flex-row md:items-start md:py-16">
        <div className="flex-1 space-y-3">
          <p className="text-h3 text-mdt-muted">Sign in</p>
          <h1 className="text-display">Welcome back to your town</h1>
          <p className="text-body text-mdt-muted max-w-xl">
            Use your GitHub account to access your private markdown sections. You can always
            revoke access in GitHub settings.
          </p>
          <div className="flex flex-wrap gap-3">
            <GithubLoginButton callbackUrl={callbackUrl} disabled={!githubConfigured}>
              {githubConfigured ? "Continue with GitHub" : "GitHub not configured"}
            </GithubLoginButton>
            <Button variant="secondary" asChild>
              <Link href="/">Cancel</Link>
            </Button>
          </div>
          {!githubConfigured && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-mdt-md px-3 py-2">
              GitHub OAuth is not configured in this environment. Add GITHUB_CLIENT_ID/SECRET or use the demo login below.
            </p>
          )}
          {error && (
            <p className="text-sm text-red-600">
              Sign-in failed: {error.replaceAll("_", " ")}
            </p>
          )}
        </div>

        <div className="flex-1 w-full max-w-xl">
          <Card className="space-y-4">
            <div className="space-y-1">
              <p className="text-h3">What you get</p>
              <p className="text-body text-mdt-muted">
                Private storage for your sections, live preview, and agent-ready exports.
              </p>
            </div>
            <ul className="space-y-2 text-body text-mdt-muted list-disc pl-5">
              <li>Secure OAuth via GitHub</li>
              <li>Session-backed API access to sections</li>
              <li>Compose, edit, and preview in real time</li>
            </ul>
            <div className="rounded-mdt-lg bg-mdt-bg-soft p-3 text-body-sm text-mdt-muted">
              By continuing, you agree to keep your credentials safe and abide by our acceptable use.
            </div>
            <GithubLoginButton callbackUrl={callbackUrl} disabled={!githubConfigured} className="w-full">
              {githubConfigured ? "Sign in with GitHub" : "GitHub not configured"}
            </GithubLoginButton>
            {demoLoginEnabled && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-mdt-muted">
                  <span>Demo login (local dev)</span>
                  <span className="font-mono bg-mdt-surface-subtle px-2 py-1 rounded-md border border-mdt-border">
                    {demoPassword}
                  </span>
                </div>
                <DemoLoginButton password={demoPassword} callbackUrl={callbackUrl} />
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
