import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Complete Court Guide — NY Family Court Orders of Protection",
  description:
    "Step-by-step guide to filing for an Order of Protection in New York Family Court: eligibility, required forms, what to say to the judge, timelines, and more.",
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Who can file for an Order of Protection in New York Family Court?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can file if you and the other person are related by blood or marriage, married or formerly married, have a child in common, or are or were in an intimate relationship.",
      },
    },
    {
      "@type": "Question",
      name: "What conduct qualifies as a family offense in New York?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Qualifying offenses include disorderly conduct, harassment, aggravated harassment, menacing, reckless endangerment, criminal mischief, assault, attempted assault, stalking, sexual offenses, and other offenses listed under the Family Court Act.",
      },
    },
    {
      "@type": "Question",
      name: "How long do Orders of Protection last in New York?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A final Order of Protection typically lasts 2 years. With aggravating circumstances such as weapons access, prior violations, or violence against children, it can last up to 5 years.",
      },
    },
    {
      "@type": "Question",
      name: "How much does it cost to file for an Order of Protection?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "There is no filing fee to file for an Order of Protection in New York Family Court.",
      },
    },
    {
      "@type": "Question",
      name: "What happens if an Order of Protection is violated?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Violating a temporary or final Order of Protection is a crime. You should call 911 if in danger, document the violation, file a Violation Petition (form GF-8) in Family Court, and report it to police.",
      },
    },
  ],
};

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  );
}
