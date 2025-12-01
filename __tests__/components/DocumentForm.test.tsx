import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { DocumentForm } from "@/components/documents/DocumentForm";

// Mock next/navigation router
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
}));

// Mock fetch for snippets
const snippets = [
  { id: "s1", title: "Snippet One", description: "Alpha content" },
  { id: "s2", title: "Snippet Two", description: "Beta content" },
];

describe("DocumentForm", () => {
  beforeEach(() => {
    global.fetch = vi.fn(async (url: RequestInfo | URL) => {
      if (typeof url === "string" && url.includes("/api/public/items")) {
        return {
          ok: true,
          json: async () => ({ items: snippets }),
        } as unknown as Response;
      }
      return { ok: true, json: async () => ({ id: "doc1" }) } as unknown as Response;
    }) as unknown as typeof fetch;
  });

  it("inserts selected snippet into content", async () => {
    render(<DocumentForm initial={{ title: "", tags: [], renderedContent: "" }} />);

    // wait for snippets to load
    await waitFor(() => expect(fetch).toHaveBeenCalled());

    const select = await screen.findByLabelText(/choose snippet/i);
    await userEvent.selectOptions(select, "s2");
    await userEvent.click(screen.getByRole("button", { name: /insert into document/i }));

    const content = screen.getByRole("textbox", { name: /agents\.md content/i }) as HTMLTextAreaElement;
    expect(content.value).toContain("Snippet Two");
    expect(content.value).toContain("Beta content");
  });
});
