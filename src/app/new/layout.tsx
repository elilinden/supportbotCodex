import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Intake",
  robots: { index: false, follow: false },
};

export default function NewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
