import React from "react";
import { render, waitFor, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SectionComposer } from "@/components/SectionComposer";

// Mock next/link for Slot usage inside Button
vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

// Mock react-markdown and remark-gfm to keep render lightweight
vi.mock("react-markdown", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="markdown-preview">{children}</div>
  ),
}));
vi.mock("remark-gfm", () => ({ __esModule: true, default: () => ({}) }));

// Mock next/dynamic to return the component immediately
vi.mock("next/dynamic", () => ({
  __esModule: true,
  default: (loader: any) => {
    const Comp = React.lazy(loader);
    return (props: any) => (
      <React.Suspense fallback={<div>loading...</div>}>
        <Comp {...props} />
      </React.Suspense>
    );
  },
}));

const sections = [
  { id: "1", title: "Hello", content: "# Hi", order: 1 },
];

function mockFetch() {
  let call = 0;
  global.fetch = vi.fn(async (_url: string, init?: RequestInit) => {
    // first call load, second POST create
    if (!init) {
      return {
        ok: true,
        json: async () => sections,
      } as any;
    }
    if (init.method === "POST") {
      call += 1;
      return {
        ok: true,
        json: async () => ({ id: `new-${call}`, title: "Untitled section", content: "", order: sections.length + call }),
      } as any;
    }
    return { ok: true, json: async () => ({}) } as any;
  }) as any;
}

describe("SectionComposer", () => {
  beforeEach(() => {
    mockFetch();
  });

  it("loads sections and shows preview text", async () => {
    render(<SectionComposer />);

    await screen.findByText("Hello");
    await screen.findByTestId("markdown-preview");
    expect(screen.getByTestId("markdown-preview").textContent).toContain("Hi");
  });

  it("adds a new section when Add is clicked", async () => {
    render(<SectionComposer />);
    const addButton = await screen.findByRole("button", { name: /add/i });
    await userEvent.click(addButton);

    await waitFor(() => {
      expect((fetch as any).mock.calls.some(([, init]: any) => init?.method === "POST")).toBe(true);
    });
  });
});
