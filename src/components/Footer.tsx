import Link from "next/link";

const year = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="mt-16 border-t border-ui-border bg-ui-surface/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-ui-text sm:px-6">
        <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="text-sm font-semibold">Pro-Se Prime</p>
            <p className="text-xs text-ui-textMuted">
              Information-only. Not legal advice. No attorney-client relationship.
            </p>
          </div>
          <p className="text-xs text-ui-textMuted">&copy; {year} Pro-Se Prime</p>
        </div>
        <nav className="flex flex-wrap justify-center gap-3 sm:justify-start" aria-label="Footer navigation">
          <Link
            href="/about"
            className="rounded-full border border-ui-border bg-ui-surface px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ui-text shadow-sm hover:border-ui-borderStrong"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-ui-border bg-ui-surface px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ui-text shadow-sm hover:border-ui-borderStrong"
          >
            Contact
          </Link>
          <Link
            href="/privacy"
            className="rounded-full border border-ui-border bg-ui-surface px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ui-text shadow-sm hover:border-ui-borderStrong"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="rounded-full border border-ui-border bg-ui-surface px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ui-text shadow-sm hover:border-ui-borderStrong"
          >
            Terms of Service
          </Link>
        </nav>
      </div>
    </footer>
  );
}
