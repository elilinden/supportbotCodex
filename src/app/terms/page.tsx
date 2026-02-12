import type { Metadata } from "next";
import { GlassCard, GlassCardStrong } from "@/components/GlassCard";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for Pro-Se Prime. This tool provides general information only — not legal advice.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <GlassCardStrong className="border border-black/10 bg-white/80 text-slate-900">
        <h1 className="text-2xl font-semibold">Terms of Service</h1>
        <p className="mt-2 text-sm text-slate-600">Last updated: February 10, 2026</p>
      </GlassCardStrong>

      <GlassCard className="border border-black/10 bg-white/70 text-slate-900">
        <div className="space-y-6 text-sm text-slate-700">
          <p>
            These Terms of Service (“Terms”) govern your access to and use of Pro-Se Prime (the “Service”).
            By accessing or using the Service, you agree to be bound by these Terms. If you do not agree,
            do not use the Service.
          </p>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-slate-900">1) Information-Only; No Legal Advice</h2>
            <p>
              The Service provides general, educational information and self-help tools related to New York Family Court
              Orders of Protection. The Service is not a law firm, does not provide legal advice, and does not provide
              attorney services. Any outputs (including summaries, scripts, checklists, suggested questions, or timelines)
              are information-only and may be incomplete, inaccurate, outdated, or not applicable to your situation.
            </p>
            <p>
              You are solely responsible for verifying information with official court resources and for your decisions,
              filings, communications, and actions. You should consult a licensed attorney for legal advice.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-slate-900">2) No Attorney–Client Relationship; No Confidentiality</h2>
            <p>
              Use of the Service does not create an attorney–client relationship, fiduciary relationship, or any duty of
              confidentiality beyond what is described in our Privacy Policy. Do not submit information you consider
              privileged unless you understand and accept how the Service processes and stores data.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-slate-900">3) Emergencies and Safety</h2>
            <p>
              The Service is not designed for emergencies. If you are in immediate danger or need urgent help, call 911 or
              your local emergency number immediately. Do not rely on the Service for crisis response, safety planning, or
              time-sensitive protective actions.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-slate-900">4) Eligibility; Geographic Scope</h2>
            <p>
              The Service is intended for general information related to New York Family Court Orders of Protection. Laws
              and court procedures change frequently and may vary by county, judge, and individual circumstances. We do not
              represent that the Service is appropriate or available for use in all locations, or that it reflects the most
              current law or court practice.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-slate-900">5) Your Responsibilities</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>You will provide accurate information to the best of your ability.</li>
              <li>You will not use the Service as a substitute for advice from a licensed attorney.</li>
              <li>
                You will independently confirm court forms, filing requirements, deadlines, service rules, and local
                procedures.
              </li>
              <li>You will use the Service in a lawful, respectful manner consistent with these Terms.</li>
              <li>
                You are responsible for maintaining the confidentiality of any device, browser, account, or access method
                you use to access the Service.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-slate-900">6) Prohibited Uses</h2>
            <p>You agree not to:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Use the Service for unlawful, harmful, abusive, harassing, threatening, or fraudulent purposes.</li>
              <li>
                Use the Service to harass, threaten, stalk, intimidate, defame, or endanger any person, or to facilitate
                wrongdoing.
              </li>
              <li>Attempt to reverse engineer, scrape, disrupt, or interfere with the Service or its security.</li>
              <li>Upload malware, exploit vulnerabilities, or attempt to gain unauthorized access to systems or data.</li>
              <li>Misrepresent your identity or impersonate another person.</li>
              <li>Use automated means to access the Service in a way that burdens or degrades it.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-slate-900">7) Intellectual Property; License</h2>
            <p>
              The Service, including its design, text, templates, and software, is owned by us and protected by
              intellectual property laws. Subject to these Terms, we grant you a limited, non-exclusive, non-transferable,
              revocable license to access and use the Service for your personal, non-commercial use.
            </p>
            <p>
              You retain ownership of the information you enter into the Service (“User Content”). You grant us a limited
              license to process User Content solely to operate, maintain, secure, and improve the Service, consistent with
              our Privacy Policy.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-slate-900">8) Third-Party Links and Services</h2>
            <p>
              The Service may reference or link to third-party resources (including court sites, hotlines, or informational
              sources). We do not control and are not responsible for third-party content, policies, availability, or
              actions. Your use of third-party sites is at your own risk and subject to their terms.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-slate-900">9) Disclaimers</h2>
            <p className="font-semibold text-slate-900">THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE.”</p>
            <p>
              To the maximum extent permitted by law, we disclaim all warranties of any kind, whether express, implied, or
              statutory, including warranties of merchantability, fitness for a particular purpose, non-infringement,
              accuracy, and availability. We do not warrant that the Service will be uninterrupted, error-free, secure, or
              that outputs will be correct, complete, current, or suitable for your circumstances.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-slate-900">10) Limitation of Liability</h2>
            <p className="font-semibold text-slate-900">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
              CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER
              INTANGIBLE LOSSES.
            </p>
            <p>
              To the maximum extent permitted by law, our total liability for any claim arising out of or relating to the
              Service or these Terms will not exceed the greater of (a) $50 or (b) the amount you paid us (if any) to use
              the Service in the 12 months before the event giving rise to the claim.
            </p>
            <p>
              Some jurisdictions do not allow certain limitations. In that case, the above limitations apply to the fullest
              extent permitted by applicable law.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-slate-900">11) Indemnification</h2>
            <p>
              You agree to defend, indemnify, and hold harmless Pro-Se Prime and its owners, affiliates, and contributors
              from and against any claims, damages, liabilities, losses, and expenses (including reasonable attorneys’ fees)
              arising out of or relating to: (a) your use of the Service; (b) your violation of these Terms; (c) your User
              Content; or (d) your violation of any law or the rights of any third party.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-slate-900">12) Suspension and Termination</h2>
            <p>
              We may suspend or terminate your access to the Service at any time if we believe you violated these Terms or
              if your use poses risk to others, the Service, or our operations. You may stop using the Service at any time.
              Sections that by their nature should survive termination will survive (including Sections 7–15).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-slate-900">13) Changes to the Service and Terms</h2>
            <p>
              We may modify, update, or discontinue the Service at any time. We may also update these Terms from time to
              time. The “Last updated” date reflects the most recent revision. Continued use of the Service after changes
              become effective constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-slate-900">14) Governing Law; Venue</h2>
            <p>
              These Terms are governed by the laws of the State of New York, without regard to conflict-of-law rules. Any
              dispute arising out of or relating to these Terms or the Service will be brought exclusively in the state or
              federal courts located in New York County, New York, and you consent to personal jurisdiction and venue there.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-slate-900">15) Miscellaneous</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <span className="font-semibold text-slate-900">Severability:</span> If any provision is found
                unenforceable, the remaining provisions remain in effect.
              </li>
              <li>
                <span className="font-semibold text-slate-900">No waiver:</span> Our failure to enforce a provision is not a
                waiver of our right to do so later.
              </li>
              <li>
                <span className="font-semibold text-slate-900">Entire agreement:</span> These Terms and the Privacy Policy
                constitute the entire agreement regarding the Service.
              </li>
              <li>
                <span className="font-semibold text-slate-900">Assignment:</span> You may not assign these Terms without our
                prior written consent. We may assign these Terms as part of a merger, acquisition, or sale of assets.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-slate-900">16) Contact</h2>
            <p>
              Questions about these Terms:{" "}
              <a
                href="mailto:support@proseprime.org"
                className="font-semibold text-slate-900 underline underline-offset-4"
              >
                support@proseprime.org
              </a>
            </p>
          </section>
        </div>
      </GlassCard>
    </div>
  );
}
