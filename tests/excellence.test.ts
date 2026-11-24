import { describe, expect, it } from "bun:test";
import { calculateExcellenceTotal, getDefaultExcellenceTerm } from "../src/lib/excellence";

describe("school excellence score", () => {
  it("awards 100 points when all three criteria reach 100%", () => {
    expect(calculateExcellenceTotal(100, 100, 100)).toBe(100);
  });

  it("applies the requested 50/25/25 weights", () => {
    expect(calculateExcellenceTotal(70, 80, 40)).toBe(65);
  });

  it("awards zero when no criterion has been met", () => {
    expect(calculateExcellenceTotal(0, 0, 0)).toBe(0);
  });
});

describe("default school term", () => {
  it("selects term 1 in November", () => {
    expect(getDefaultExcellenceTerm(new Date("2026-11-24T12:00:00Z"))).toBe(1);
  });

  it("selects term 2 in February", () => {
    expect(getDefaultExcellenceTerm(new Date("2026-02-10T12:00:00Z"))).toBe(2);
  });

  it("selects the annual term 3 ranking in May", () => {
    expect(getDefaultExcellenceTerm(new Date("2026-05-10T12:00:00Z"))).toBe(3);
  });
});
