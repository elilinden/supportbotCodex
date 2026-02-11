"use client";

import { RequireAuth } from "@/components/RequireAuth";

export default function CaseLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
