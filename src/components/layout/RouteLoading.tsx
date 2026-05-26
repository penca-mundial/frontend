/** Full-screen loading state shown while the auth state is hydrating. */
export function RouteLoading() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      role="status"
      aria-label="Cargando"
    >
      <div className="border-muted border-t-foreground size-8 animate-spin rounded-full border-2" />
    </div>
  )
}
