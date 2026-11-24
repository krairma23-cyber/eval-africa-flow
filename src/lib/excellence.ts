export const EXCELLENCE_WEIGHTS = {
  pedagogical: 50,
  bulletins: 25,
  parents: 25,
} as const;

export const EXCELLENCE_TERMS = [
  { value: 1, label: "Trimestre 1", shortLabel: "T1" },
  { value: 2, label: "Trimestre 2", shortLabel: "T2" },
  { value: 3, label: "Trimestre 3", shortLabel: "T3" },
] as const;

export interface PublicExcellenceEntry {
  school_name: string;
  country: string;
  city: string | null;
  rank: number;
  score: number;
  academic_year_name: string;
  term_number: number;
  is_annual: boolean;
  calculated_at: string;
}

export interface SchoolExcellenceScore {
  school_name: string;
  country: string;
  city: string | null;
  academic_year_name: string;
  term_number: number;
  is_annual: boolean;
  pedagogical_score: number;
  bulletin_score: number;
  parent_score: number;
  total_score: number;
  success_rate: number;
  bulletin_rate: number;
  parent_rate: number;
  result_count: number;
  on_time_reports: number;
  expected_reports: number;
  active_parents: number;
  parent_accounts: number;
  global_rank: number;
  country_rank: number;
  total_schools: number;
  country_schools: number;
  calculated_at: string;
}

const clampRate = (rate: number) => Math.min(100, Math.max(0, rate));

/** Same public formula as the server: 50% success, 25% punctuality, 25% parent engagement. */
export function calculateExcellenceTotal(
  successRate: number,
  bulletinRate: number,
  parentRate: number,
): number {
  const total =
    (clampRate(successRate) * EXCELLENCE_WEIGHTS.pedagogical +
      clampRate(bulletinRate) * EXCELLENCE_WEIGHTS.bulletins +
      clampRate(parentRate) * EXCELLENCE_WEIGHTS.parents) /
    100;
  return Math.round(total * 100) / 100;
}

export function getDefaultExcellenceTerm(date = new Date()): number {
  const month = date.getMonth();
  if (month >= 7) return 1;
  if (month <= 2) return 2;
  return 3;
}

export function getLaureateLabel(rank: number, isAnnual: boolean): string {
  if (rank === 1) return isAnnual ? "Champion annuel" : "Excellence Or";
  if (rank === 2) return isAnnual ? "2e du palmarès annuel" : "Excellence Argent";
  if (rank === 3) return isAnnual ? "3e du palmarès annuel" : "Excellence Bronze";
  return isAnnual ? "Lauréat annuel Top 10" : "Lauréat Top 10";
}

export function getExcellenceAdvice(score: SchoolExcellenceScore): string[] {
  const advice: string[] = [];

  if (score.result_count === 0) {
    advice.push("Saisissez les notes du trimestre pour mesurer et améliorer la réussite pédagogique.");
  } else if (score.success_rate < 70) {
    advice.push("Repérez les matières sous 50 % de réussite et organisez une remédiation ciblée.");
  }

  if (score.expected_reports === 0) {
    advice.push("Créez les périodes, inscrivez les élèves et générez leurs bulletins pour mesurer la ponctualité.");
  } else if (score.on_time_reports < score.expected_reports) {
    advice.push("Générez tous les bulletins au plus tard 7 jours après la fin de la période.");
  }

  if (score.parent_accounts === 0) {
    advice.push("Créez les comptes parents depuis les fiches élèves pour activer le suivi familial.");
  } else if (score.parent_rate < 60) {
    advice.push("Relancez les parents inactifs et invitez-les à consulter les bulletins sur le portail.");
  }

  if (advice.length === 0) {
    advice.push("Vos trois indicateurs sont bien suivis : maintenez cette régularité pour garder votre rang.");
  }

  return advice.slice(0, 3);
}
