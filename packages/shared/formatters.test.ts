import { describe, it, expect } from "vitest";
import { formatZAR, formatDate, centsToRand, randToCents } from "./formatters";

describe("formatZAR", () => {
  it("formats positive cents to ZAR", () => {
    expect(formatZAR(34000000)).toMatch(/340.?000/);
  });

  it("formats negative cents to ZAR", () => {
    const result = formatZAR(-297200000);
    expect(result).toContain("-");
    expect(result).toContain("R");
  });

  it("formats zero", () => {
    expect(formatZAR(0)).toMatch(/R.*0[.,]00/);
  });

  it("formats small amounts", () => {
    expect(formatZAR(150)).toMatch(/1[.,]50/);
  });
});

describe("formatDate", () => {
  it("formats Date to dd/mm/yyyy", () => {
    const result = formatDate(new Date(2026, 2, 1)); // March 1, 2026
    expect(result).toBe("01/03/2026");
  });

  it("formats ISO string", () => {
    const result = formatDate("2026-04-02T12:00:00.000Z");
    expect(result).toMatch(/02\/04\/2026/);
  });
});

describe("centsToRand", () => {
  it("converts cents to rand", () => {
    expect(centsToRand(34000000)).toBe(340000);
  });
});

describe("randToCents", () => {
  it("converts rand to cents", () => {
    expect(randToCents(340000)).toBe(34000000);
  });

  it("rounds to avoid floating point issues", () => {
    expect(randToCents(1.005)).toBe(Math.round(1.005 * 100));
  });
});
