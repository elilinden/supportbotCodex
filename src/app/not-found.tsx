import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center space-y-6">
      <p className="text-xs font-bold uppercase tracking-[0.35em] text-slate-400">
        Page Not Found
      </p>
      <h1 className="text-5xl font-bold text-ui-text">404</h1>
      <p className="max-w-md text-sm text-slate-600 leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link
          href="/"
          className="rounded-full bg-ui-primary px-7 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-blue-500/20 hover:opacity-95"
        >
          Go Home
        </Link>
        <Link
          href="/guide"
          className="rounded-full border border-slate-200 bg-white px-7 py-3 text-xs font-bold uppercase tracking-widest text-slate-700 hover:bg-slate-50"
        >
          Court Guide
        </Link>
      </div>
    </div>
  );
}
