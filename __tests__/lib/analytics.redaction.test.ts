import { describe, expect, it } from "vitest";
import { redactAnalyticsPayload } from "@/lib/analytics";

describe("redactAnalyticsPayload", () => {
  it("removes sensitive keys and preserves safe fields", () => {
    const input = {
      content: "secret",
      paths: ["a/one", "b/two"],
      files: ["AGENTS.md"],
      path: "/atlas/simulator",
      fileCount: 2,
      nested: {
        contents: "nested",
        scannedPaths: ["x"],
        keep: "ok",
      },
    };

    const result = redactAnalyticsPayload(input);

    expect(result).toEqual({
      path: "/atlas/simulator",
      fileCount: 2,
      nested: {
        keep: "ok",
      },
    });
    expect(input).toEqual({
      content: "secret",
      paths: ["a/one", "b/two"],
      files: ["AGENTS.md"],
      path: "/atlas/simulator",
      fileCount: 2,
      nested: {
        contents: "nested",
        scannedPaths: ["x"],
        keep: "ok",
      },
    });
  });

  it("redacts nested arrays of objects", () => {
    const input = {
      items: [
        { name: "one", paths: ["a"] },
        { name: "two", content: "secret" },
      ],
    };

    expect(redactAnalyticsPayload(input)).toEqual({
      items: [{ name: "one" }, { name: "two" }],
    });
  });

  it("returns undefined when given undefined", () => {
    expect(redactAnalyticsPayload(undefined)).toBeUndefined();
  });
});
