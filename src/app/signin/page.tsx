import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/Button";
import { DemoLoginButton } from "@/components/auth/DemoLoginButton";
import { GithubLoginButton } from "@/components/auth/GithubLoginButton";
import { Container } from "@/components/ui/Container";
import { Stack, Row } from "@/components/ui/Stack";
import { Surface } from "@/components/ui/Surface";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";

export const metadata = {
  title: "Sign in · mark downtown",
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
      <main id="main-content" className="py-mdt-12 md:py-mdt-16">
        <Container size="md" padding="md" className="space-y-mdt-8">
          <div className="flex items-center justify-between">
            <BrandLogo />
            <Button variant="ghost" asChild size="sm">
              <Link href="/">Back home</Link>
            </Button>
          </div>

          <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
            <Stack gap={3} className="flex-1">
              <Text size="caption" tone="muted">Sign in</Text>
              <Heading level="display" leading="tight">Welcome back to your town</Heading>
              <Text tone="muted" className="max-w-xl">
                Use your GitHub account to access your private markdown sections. You can always
                revoke access in GitHub settings.
              </Text>
              <Row wrap gap={3}>
                <GithubLoginButton callbackUrl={callbackUrl} disabled={!githubConfigured}>
                  {githubConfigured ? "Continue with GitHub" : "GitHub not configured"}
                </GithubLoginButton>
                <Button variant="secondary" asChild>
                  <Link href="/">Cancel</Link>
                </Button>
              </Row>
              {!githubConfigured && (
                <div className="rounded-mdt-md border border-[color:var(--mdt-color-warning)]/30 bg-[color:var(--mdt-color-warning)]/10 px-3 py-2 text-body-sm text-[color:var(--mdt-color-warning)]">
                  GitHub OAuth is not configured in this environment. Add GITHUB_CLIENT_ID/SECRET or use the demo login below.
                </div>
              )}
              {error && (
                <Text size="bodySm" className="text-[color:var(--mdt-color-danger)]">
                  Sign-in failed: {error.replaceAll("_", " ")}
                </Text>
              )}
            </Stack>

            <div className="flex-1 w-full max-w-xl">
              <Surface padding="lg" className="space-y-mdt-4">
                <Stack gap={1}>
                  <Heading level="h3" as="p">What you get</Heading>
                  <Text tone="muted">
                    Private storage for your sections, live preview, and agent-ready exports.
                  </Text>
                </Stack>
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
              </Surface>
            </div>
          </div>
        </Container>
      </main>
    </div>
  );
}
