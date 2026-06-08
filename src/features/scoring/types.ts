/**
 * Scoring configuration domain types (`GET /scoring_rules`, SCRUM-296).
 * Mapped from the snake_case API at the boundary. Labels arrive already
 * localized from the backend (i18n) — never hardcode scoring copy on the front.
 */

/** A single scoring rule: its machine key, points, and localized label. */
export interface ScoringRule {
  ruleType: string
  points: number
  label: string
}

/** A per-phase multiplier: its machine key, numeric multiplier, and label. */
export interface PhaseMultiplier {
  phase: string
  multiplier: number
  label: string
}

/** The full scoring configuration powering the rules page and the landing. */
export interface ScoringConfig {
  scoringRules: ScoringRule[]
  phaseMultipliers: PhaseMultiplier[]
}

/**
 * Rule types that score the tournament-wide predictions (podium + top scorer),
 * as opposed to the per-match ones. Used only to PARTITION the rules into two
 * tables for display — the copy still comes from each rule's `label`. Mirrors
 * the backend's `ScoringRule::RULE_TYPES` tail.
 */
export const SPECIAL_RULE_TYPES = new Set([
  'champion_correct',
  'runner_up_correct',
  'third_place_correct',
  'fourth_place_correct',
  'top_scorer_correct',
])
