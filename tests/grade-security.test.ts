import { describe, expect, it } from "bun:test";
import { gradeChanged, gradePayload, termGradesClosed } from "../src/lib/grade-security";

const original = { id: "result", score: 0, is_absent: false, comment: null, updated_at: "2026-11-24T16:52:00Z" };
describe("grade correction rules", () => {
  it("requires a nonblank reason for every existing-grade correction", () => {
    expect(() => gradePayload("student", { ...original, score: 12 }, 20, original, "  ")).toThrow();
  });
  it("preserves old version and required reason for a correction", () => {
    expect(gradePayload("student", { ...original, score: 12 }, 20, original, "Erreur de saisie")).toMatchObject({ result_id: "result", expected_updated_at: "2026-11-24T16:52:00Z", reason: "Erreur de saisie", score: 12 });
  });
  it("does not require a correction reason for first entry and preserves zero", () => {
    expect(gradePayload("student", { ...original, id: undefined }, 20)).toMatchObject({ score: 0, reason: null, result_id: null });
  });
  it("rejects scores outside the assessment scale", () => {
    expect(() => gradePayload("student", { ...original, score: 21 }, 20)).toThrow();
    expect(() => gradePayload("student", { ...original, score: -1 }, 20)).toThrow();
  });
  it("audits an absence or comment correction even when the score is unchanged", () => {
    expect(gradeChanged(original, { ...original, is_absent: true })).toBe(true);
    expect(gradeChanged(original, { ...original, comment: "Corrigé" })).toBe(true);
    expect(gradeChanged(original, { ...original })).toBe(false);
  });
  it("closes entries after the UTC end date, not during the final day", () => {
    expect(termGradesClosed({ end_date: "2026-11-24" }, new Date("2026-11-24T23:59:59Z"))).toBe(false);
    expect(termGradesClosed({ end_date: "2026-11-24" }, new Date("2026-11-25T00:00:00Z"))).toBe(true);
  });
  it("keeps a manually closed period closed before its end date", () => {
    expect(termGradesClosed({ end_date: "2026-12-31", grades_closed_at: "2026-11-24T16:52:00Z" }, new Date("2026-11-24T16:52:00Z"))).toBe(true);
  });
});