import React from "react";
import { render, waitFor, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, type Mock } from "vitest";
import { SectionComposer } from "@/components/SectionComposer";

// Mock next/link for Slot usage inside Button
vi.mock("next/link", () => {
  type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: React.ReactNode;
    href: string;
  };
  const Link = ({ children, href, ...rest }: LinkProps) => (
    <a href={href} {...rest}>
      {children}
    </a>
  );
  return { __esModule: true, default: Link };
});

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
  default: (loader: () => Promise<{ default: React.ComponentType<unknown> }>) => {
    const Comp = React.lazy(loader);
    return (props: Record<string, unknown>) => (
      <React.Suspense fallback={<div>loading...</div>}>
        <Comp {...props} />
      </React.Suspense>
    );
  },
}));

const sections = [
  { id: "1", title: "Hello", content: "# Hi", order: 1 },
];

type MockResponse = { ok: boolean; json: () => Promise<unknown> };

function mockFetch() {
  let call = 0;
  global.fetch = vi.fn(async (_url: string, init?: RequestInit) => {
    // first call load, second POST create
    if (!init) {
      return { ok: true, json: async () => sections } satisfies MockResponse;
    }
    if (init.method === "POST") {
      call += 1;
      return {
        ok: true,
        json: async () => ({
          id: `new-${call}`,
          title: "Untitled section",
          content: "",
          order: sections.length + call,
        }),
      } satisfies MockResponse;
    }
    return { ok: true, json: async () => ({}) } satisfies MockResponse;
  }) as unknown as typeof fetch;
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
      const calls = (fetch as unknown as Mock).mock.calls as [string, RequestInit | undefined][];
      expect(calls.some(([, init]) => init?.method === "POST")).toBe(true);
    });
  });
});
