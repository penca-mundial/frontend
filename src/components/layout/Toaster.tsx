import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast'
import { useToast } from '@/hooks/useToast'

/**
 * Renders queued toasts from the global store. Mount once near the app root so
 * any module can fire a toast via `toast(...)`. Closing is driven by Radix
 * `onOpenChange` (swipe / timeout / close button) wired back to the store.
 */
export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, variant, open }) => (
        <Toast
          key={id}
          variant={variant}
          open={open}
          onOpenChange={(next) => {
            if (!next) dismiss(id)
          }}
        >
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}
