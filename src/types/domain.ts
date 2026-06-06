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

/**
 * A penca (group) the user belongs to, as the app consumes it (camelCase, from
 * `GET /groups/me`). `isGeneralPool` marks the everyone-in tournament pool the
 * backend lists first; `code` is the invite code (shown in the detail, not the
 * card); `isOwner` is true when the current user created it.
 */
export interface Group {
  id: string
  name: string
  description: string | null
  isGeneralPool: boolean
  code: string
  memberCount: number
  isOwner: boolean
  createdAt: string
  /** Creator's username ("creada por @x"). Null until the backend exposes it. */
  ownerUsername: string | null
}

export interface RankingEntry {
  userId: string
  username: string | null
  points: number
  position: number
  exactCount: number
  avatarUrl: string | null
}

/** A member of a penca (`GET /groups/:id/members`). */
export interface GroupMember {
  userId: string
  username: string | null
  avatarUrl: string | null
  isOwner: boolean
  joinedAt: string
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
