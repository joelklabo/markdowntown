import { describe, it, expect, beforeEach, vi } from "vitest";

// In-memory store to simulate DB
const store: any[] = [];

const prismaMock = {
  section: {
    count: vi.fn(async ({ where }: any) =>
      store.filter((s) => !where?.userId || s.userId === where.userId).length
    ),
    create: vi.fn(async ({ data }: any) => {
      const created = {
        id: `sec-${store.length + 1}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data,
      };
      store.push(created);
      return created;
    }),
    findMany: vi.fn(async ({ where, orderBy }: any) => {
      const items = store.filter((s) => !where?.userId || s.userId === where.userId);
      if (orderBy?.length) {
        return items.sort((a, b) => a.order - b.order || a.createdAt - b.createdAt);
      }
      return items;
    }),
    findFirst: vi.fn(async ({ where }: any) =>
      store.find((s) => s.id === where.id && (!where.userId || s.userId === where.userId)) ?? null
    ),
    update: vi.fn(async ({ where, data }: any) => {
      const idx = store.findIndex((s) => s.id === where.id);
      if (idx === -1) throw new Error("Not found");
      store[idx] = { ...store[idx], ...data, updatedAt: new Date() };
      return store[idx];
    }),
    delete: vi.fn(async ({ where }: any) => {
      const idx = store.findIndex((s) => s.id === where.id);
      if (idx === -1) throw new Error("Not found");
      const [removed] = store.splice(idx, 1);
      return removed;
    }),
  },
};

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

const authMock = vi.fn(async () => ({ user: { id: "user-1" } }));
vi.mock("@/lib/auth", () => ({ auth: authMock }));

// Route handlers under test
const routePromise = import("@/app/api/sections/route");
const routeWithIdPromise = import("@/app/api/sections/[id]/route");

describe("sections API CRUD", () => {
  beforeEach(() => {
    store.length = 0;
    Object.values(prismaMock.section).forEach((fn: any) => fn.mockClear?.());
    authMock.mockReset();
    authMock.mockResolvedValue({ user: { id: "user-1" } });
  });

  it("requires auth on list", async () => {
    authMock.mockResolvedValueOnce(null);
    const { GET } = await routePromise;
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("creates and lists sections for the user", async () => {
    const { POST, GET } = await routePromise;
    await POST(
      new Request("http://localhost/api/sections", {
        method: "POST",
        body: JSON.stringify({ title: "First", content: "A" }),
      })
    );
    await POST(
      new Request("http://localhost/api/sections", {
        method: "POST",
        body: JSON.stringify({ title: "Second", content: "B" }),
      })
    );

    const res = await GET();
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json).toHaveLength(2);
    expect(json[0].order).toBe(0);
    expect(json[1].title).toBe("Second");
  });

  it("updates a section", async () => {
    const { POST } = await routePromise;
    const { PUT } = await routeWithIdPromise;

    const createdRes = await POST(
      new Request("http://localhost/api/sections", {
        method: "POST",
        body: JSON.stringify({ title: "Edit me", content: "Old" }),
      })
    );
    const created = await createdRes.json();
    const ctx = { params: Promise.resolve({ id: created.id }) } as any;

    const res = await PUT(
      new Request("http://localhost/api/sections/id", {
        method: "PUT",
        body: JSON.stringify({ title: "New title", content: "New content" }),
      }),
      ctx
    );
    const updated = await res.json();
    expect(res.status).toBe(200);
    expect(updated.title).toBe("New title");
    expect(updated.content).toBe("New content");
  });

  it("deletes a section", async () => {
    const { POST } = await routePromise;
    const { DELETE } = await routeWithIdPromise;

    const createdRes = await POST(
      new Request("http://localhost/api/sections", {
        method: "POST",
        body: JSON.stringify({ title: "Delete me", content: "Bye" }),
      })
    );
    const created = await createdRes.json();
    const ctx = { params: Promise.resolve({ id: created.id }) } as any;

    const res = await DELETE(new Request("http://localhost/api/sections/id"), ctx);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(store).toHaveLength(0);
  });
});
