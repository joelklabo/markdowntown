import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeTags } from "@/lib/tags";
import { DocumentForm } from "@/components/documents/DocumentForm";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

type Params = { id: string };

export default async function EditDocumentPage({ params }: { params: Promise<Params> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/api/auth/signin?callbackUrl=/documents");
  const { id } = await params;
  const doc = await prisma.document.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!doc) return notFound();

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      <Breadcrumb
        segments={[
          { href: "/", label: "Home" },
          { href: "/documents", label: "Documents" },
          { label: doc.title },
        ]}
      />
      <div className="space-y-2">
        <h1 className="text-display">Edit agents.md</h1>
        <p className="text-mdt-muted">Update content, then save and export.</p>
      </div>
      <DocumentForm
        initial={{
          id: doc.id,
          title: doc.title,
          description: doc.description,
          renderedContent: doc.renderedContent ?? "",
          tags: normalizeTags(doc.tags, { strict: false }).tags,
        }}
      />
    </main>
  );
}
