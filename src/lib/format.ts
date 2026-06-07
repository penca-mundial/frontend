/** Thousands separator in the rioplatense style: 1247 -> "1.247". */
export function formatThousands(value: number): string {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}
