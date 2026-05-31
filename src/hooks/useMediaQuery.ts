import * as React from 'react'

/**
 * Subscribe to a CSS media query and re-render when it changes. Returns the
 * current match. SSR/no-`matchMedia` environments resolve to `false` until the
 * effect runs. Used to branch desktop vs mobile layouts (e.g. inline expansion
 * vs bottom sheet) — prefer this over reading `window.innerWidth` directly.
 */
export function useMediaQuery(query: string): boolean {
  const getMatch = React.useCallback(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return false
    }
    return window.matchMedia(query).matches
  }, [query])

  const [matches, setMatches] = React.useState(getMatch)

  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return
    }
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    // Sync immediately in case the query changed between render and effect.
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}
