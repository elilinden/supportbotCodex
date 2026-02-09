import Link from "next/link";

const year = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200/70 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-slate-900 sm:px-6">
        <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="text-sm font-semibold">Pro-Se Prime</p>
            <p className="text-xs text-slate-600">
              Information-only. Not legal advice. No attorney-client relationship.
            </p>
          </div>
          <p className="text-xs text-slate-500">© {year} Pro-Se Prime</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
          <Link
            href="/about"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 shadow-sm hover:border-slate-300"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 shadow-sm hover:border-slate-300"
          >
            Contact
          </Link>
          <Link
            href="/privacy"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 shadow-sm hover:border-slate-300"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 shadow-sm hover:border-slate-300"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
