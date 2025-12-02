import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export const metadata = {
  title: "Not found · MarkdownTown",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-mdt-bg-soft text-mdt-text">
      <header className="border-b border-mdt-border bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <BrandLogo />
          <Button variant="secondary" size="sm" asChild>
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-16">
        <Card className="w-full max-w-xl space-y-4 text-center">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-mdt-lg bg-[rgba(0,87,217,0.08)] text-mdt-blue text-2xl font-semibold">
              404
            </div>
          </div>
          <h1 className="text-h1">Page not found</h1>
          <p className="text-body text-mdt-muted">
            The page you’re looking for doesn’t exist. Head back to the town square to keep composing.
          </p>
          <div className="flex justify-center gap-3">
            <Button asChild>
              <Link href="/">Go home</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/signin?callbackUrl=/">Sign in</Link>
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
