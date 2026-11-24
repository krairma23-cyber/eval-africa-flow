import { z } from "zod";

export interface GradeValue {
  id?: string;
  score: number | null;
  is_absent: boolean;
  comment: string | null;
  updated_at?: string | null;
  locked_at?: string;
}

export function gradeChanged(previous: GradeValue, next: GradeValue) {
  return previous.score !== next.score || previous.is_absent !== next.is_absent ||
    (previous.comment || "") !== (next.comment || "");
}

export function gradePayload(studentId: string, next: GradeValue, maxScore: number, previous?: GradeValue, reason = "") {
  const score = next.is_absent ? null : z.number().finite().min(0).max(maxScore).parse(next.score);
  const correctionReason = previous?.id ? z.string().trim().min(1, "Un motif de correction est obligatoire.").max(2000).parse(reason) : null;
  return {
    student_id: studentId, score, is_absent: next.is_absent, comment: next.comment || null,
    result_id: previous?.id || null, expected_updated_at: previous?.updated_at || null,
    reason: correctionReason,
  };
}

export function termGradesClosed(term: { grades_closed_at?: string | null; end_date: string }, now = new Date()) {
  return Boolean(term.grades_closed_at) || term.end_date < now.toISOString().slice(0, 10);
}

export const gradeAuditFlags: Record<string, string> = {
  closed_period: "Après clôture", large_change: "Écart ≥ 25 % du barème",
  absence_change: "Absence modifiée", repeated_change: "Corrections répétées sur 24 h",
};