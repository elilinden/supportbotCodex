import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Complete Court Guide — NY Family Court Orders of Protection",
  description:
    "Step-by-step guide to filing for an Order of Protection in New York Family Court: eligibility, required forms, what to say to the judge, timelines, and more.",
};

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return children;
}
