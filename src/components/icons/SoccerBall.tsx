import type { SVGProps } from 'react'

/**
 * Soccer-ball glyph in the lucide line style (24×24, `currentColor`, round
 * joins) — lucide-react ships no soccer ball, so this fills the gap for the
 * top-scorer row. Decorative by default (`aria-hidden`); size via `className`.
 */
export function SoccerBall({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 7l4.3 3.1-1.6 5h-5.4l-1.6-5z" />
      <path d="M12 7V2.5" />
      <path d="M16.3 10.1l3.8-1.4" />
      <path d="M14.7 15.1l2.9 3.2" />
      <path d="M9.3 15.1l-2.9 3.2" />
      <path d="M7.7 10.1L3.9 8.7" />
    </svg>
  )
}
