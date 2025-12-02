import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DocumentForm } from "@/components/documents/DocumentForm";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

export default async function NewDocumentPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/documents/new");

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      <Breadcrumb
        segments={[
          { href: "/", label: "Home" },
          { href: "/documents", label: "Documents" },
          { label: "New" },
        ]}
      />
      <div className="space-y-2">
        <h1 className="text-display">New agents.md</h1>
        <p className="text-mdt-muted">Create a document to assemble snippets and templates.</p>
      </div>
      <DocumentForm />
    </main>
  );
}
