import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { normalizeTags } from "@/lib/tags";

export default async function DocumentsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/api/auth/signin?callbackUrl=/documents");

  const docs = await prisma.document.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <main id="main-content" className="mx-auto max-w-5xl px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-caption text-mdt-muted">Documents</p>
          <h1 className="text-display">Your agents.md files</h1>
        </div>
        <Button asChild>
          <Link href="/documents/new">New document</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {docs.map((doc) => {
          const tags = normalizeTags(doc.tags, { strict: false }).tags;
          return (
            <Card key={doc.id} className="space-y-2 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-h3">{doc.title}</h3>
                <Button variant="secondary" size="sm" asChild>
                  <Link href={`/documents/${doc.id}`}>Edit</Link>
                </Button>
              </div>
              <p className="text-sm text-mdt-muted line-clamp-2">{doc.description}</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Pill key={tag} tone="gray">#{tag}</Pill>
                ))}
              </div>
              <p className="text-xs text-mdt-muted">Updated {doc.updatedAt.toDateString()}</p>
            </Card>
          );
        })}
        {docs.length === 0 && (
          <Card className="p-6 text-sm text-mdt-muted">No documents yet. Create your first agents.md.</Card>
        )}
      </div>
    </main>
  );
}
