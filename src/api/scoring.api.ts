import { get } from '@/api/client'
import type {
  PhaseMultiplierResponse,
  ScoringConfigResponse,
  ScoringRuleResponse,
} from '@/types/api'
import type {
  PhaseMultiplier,
  ScoringConfig,
  ScoringRule,
} from '@/features/scoring/types'

function mapRule(rule: ScoringRuleResponse): ScoringRule {
  return { ruleType: rule.rule_type, points: rule.points, label: rule.label }
}

function mapMultiplier(row: PhaseMultiplierResponse): PhaseMultiplier {
  return { phase: row.phase, multiplier: row.multiplier, label: row.label }
}

export const scoringApi = {
  /**
   * The full scoring configuration (`GET /scoring_rules`, SCRUM-296 — public,
   * server-cached 30s). Per-match + special rule points and per-phase
   * multipliers, read from the admin-editable models so the page never drifts
   * from the real scoring engine. Rows arrive in canonical enum order; labels
   * come already localized. Maps to camelCase, order preserved.
   */
  async get(): Promise<ScoringConfig> {
    const data = await get<ScoringConfigResponse>('/scoring_rules')
    return {
      scoringRules: (data.scoring_rules ?? []).map(mapRule),
      phaseMultipliers: (data.phase_multipliers ?? []).map(mapMultiplier),
    }
  },
}
