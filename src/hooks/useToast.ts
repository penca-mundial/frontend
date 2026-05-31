import * as React from 'react'

/**
 * Minimal toast store, in the shadcn/ui spirit but trimmed to what the app
 * needs: an imperative `toast()` to enqueue and a `useToast()` hook for the
 * <Toaster> to subscribe. State lives in a module-level singleton so any module
 * can fire a toast without threading a context through the tree.
 */

export type ToastVariant = 'default' | 'destructive'

export interface ToastOptions {
  title?: React.ReactNode
  description?: React.ReactNode
  variant?: ToastVariant
  /** Auto-dismiss delay in ms. Defaults to 5000; pass Infinity to persist. */
  duration?: number
}

export interface ToasterToast extends ToastOptions {
  id: string
  open: boolean
}

const DEFAULT_DURATION = 5000

let counter = 0
function nextId(): string {
  counter += 1
  return counter.toString()
}

let toasts: ToasterToast[] = []
const listeners = new Set<(toasts: ToasterToast[]) => void>()
const timeouts = new Map<string, ReturnType<typeof setTimeout>>()

function emit(): void {
  for (const listener of listeners) {
    listener(toasts)
  }
}

function scheduleRemoval(id: string): void {
  // Allow the close animation to run before the toast leaves the DOM.
  const timeout = setTimeout(() => {
    timeouts.delete(id)
    toasts = toasts.filter((t) => t.id !== id)
    emit()
  }, 200)
  timeouts.set(id, timeout)
}

/** Mark a toast closed (begins its exit animation, then removes it). */
export function dismissToast(id: string): void {
  toasts = toasts.map((t) => (t.id === id ? { ...t, open: false } : t))
  emit()
  if (!timeouts.has(id)) {
    scheduleRemoval(id)
  }
}

/** Enqueue a toast. Returns the id and a `dismiss` handle. */
export function toast(options: ToastOptions): {
  id: string
  dismiss: () => void
} {
  const id = nextId()
  const duration = options.duration ?? DEFAULT_DURATION
  toasts = [{ ...options, id, open: true }, ...toasts]
  emit()

  if (duration !== Infinity) {
    setTimeout(() => dismissToast(id), duration)
  }

  return { id, dismiss: () => dismissToast(id) }
}

/** Subscribe to the toast queue. Used by the <Toaster>. */
export function useToast(): {
  toasts: ToasterToast[]
  toast: typeof toast
  dismiss: (id: string) => void
} {
  const [state, setState] = React.useState<ToasterToast[]>(toasts)

  React.useEffect(() => {
    listeners.add(setState)
    setState(toasts)
    return () => {
      listeners.delete(setState)
    }
  }, [])

  return { toasts: state, toast, dismiss: dismissToast }
}
