"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="mx-auto mt-20 max-w-lg space-y-6 text-center">
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-red-700">Something went wrong</h2>
        <p className="mt-2 text-sm text-slate-600">
          An unexpected error occurred. Your data is safe in local storage.
        </p>
        {error.message ? (
          <p className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-xs font-mono text-slate-500">
            {error.message}
          </p>
        ) : null}
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-full border border-slate-200 bg-white px-5 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="rounded-full bg-blue-600 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-blue-700"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
