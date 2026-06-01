import { useEffect, useRef, useState } from 'react'

/**
 * Counts `initialSeconds` down to 0, ticking every second, and calls
 * `onElapsed` exactly once when it reaches 0. Resets when `initialSeconds`
 * changes (e.g. after a refetch). `onElapsed` is read through a ref so passing
 * an inline callback doesn't restart the timer or fire it more than once.
 */
export function useCountdown(
  initialSeconds: number,
  onElapsed?: () => void,
): number {
  const [seconds, setSeconds] = useState(initialSeconds)
  const onElapsedRef = useRef(onElapsed)
  onElapsedRef.current = onElapsed
  const firedRef = useRef(false)

  useEffect(() => {
    setSeconds(initialSeconds)
    firedRef.current = false
  }, [initialSeconds])

  useEffect(() => {
    if (seconds <= 0) {
      if (!firedRef.current) {
        firedRef.current = true
        onElapsedRef.current?.()
      }
      return
    }
    const id = setInterval(() => {
      setSeconds((current) => Math.max(0, current - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [seconds])

  return seconds
}
