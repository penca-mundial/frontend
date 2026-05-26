// Stub domain types. Shapes approximate the backend Blueprinter output and
// will be tightened as backend tickets land.

export interface User {
  id: string
  email: string
  username: string | null
  isAdmin: boolean
  createdAt: string
}

export interface Team {
  id: string
  name: string
  code: string
  flagUrl: string | null
}

export interface Player {
  id: string
  name: string
  teamId: string
  position: string | null
}

export interface Match {
  id: string
  homeTeamId: string
  awayTeamId: string
  kickoffAt: string
  status: string
  homeScore: number | null
  awayScore: number | null
}

export interface Prediction {
  id: string
  matchId: string
  userId: string
  homeScore: number
  awayScore: number
  points: number | null
}

export interface Group {
  id: string
  name: string
  ownerId: string
  joinCode: string
}

export interface RankingEntry {
  userId: string
  username: string | null
  points: number
  position: number
}

export interface ScoringRule {
  id: string
  key: string
  points: number
}

export interface PhaseMultiplier {
  id: string
  phase: string
  multiplier: number
}
