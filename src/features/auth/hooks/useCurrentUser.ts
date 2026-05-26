import { useContext } from 'react'
import { AuthContext, type AuthContextValue } from '@/contexts/AuthContext'

/**
 * Canonical way for components to read the authenticated user. Must be used
 * within an <AuthProvider>.
 */
export function useCurrentUser(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useCurrentUser must be used within an <AuthProvider>')
  }
  return context
}
