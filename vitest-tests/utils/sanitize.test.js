import { describe, expect, it } from "vitest";
import { sanitizeHtml } from "../../src/utils/sanitize";

describe("utils/sanitize", () => {
  it("removes unsafe script tags", () => {
    const dirty = `<p>Hello</p><script>alert("x")</script>`;
    const clean = sanitizeHtml(dirty);
    expect(clean).toContain("<p>Hello</p>");
    expect(clean).not.toContain("<script>");
  });

  it("handles empty input", () => {
    expect(sanitizeHtml("")).toBe("");
    expect(sanitizeHtml(null)).toBe("");
  });
});
