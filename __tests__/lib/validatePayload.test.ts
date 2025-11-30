import { describe, it, expect } from "vitest";
import { validatePayload } from "@/app/api/sections/route";

describe("validatePayload", () => {
  it("rejects missing title", () => {
    expect(validatePayload(null, "content")).toMatch(/Title is required/);
  });

  it("rejects long title", () => {
    const title = "x".repeat(141);
    expect(validatePayload(title, "ok")).toMatch(/too long/);
  });

  it("rejects long content", () => {
    const content = "x".repeat(10_001);
    expect(validatePayload("ok", content)).toMatch(/too long/);
  });

  it("rejects script tags", () => {
    expect(validatePayload("ok", "<script>alert(1)</script>")).toMatch(/disallowed/);
  });

  it("allows valid payload", () => {
    expect(validatePayload("ok", "safe" )).toBeNull();
  });
});
