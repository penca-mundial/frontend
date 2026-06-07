import { version } from '../../../package.json'

/** Minimal site footer: copyright and app version. */
export function Footer() {
  return (
    <footer className="text-muted-foreground border-t py-4 text-center text-sm">
      <p>
        © {new Date().getFullYear()} Magic Penca · v{version}
      </p>
    </footer>
  )
}
