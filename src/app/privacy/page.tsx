import type { Metadata } from "next";
import { GlassCard, GlassCardStrong } from "@/components/GlassCard";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Pro-Se Prime protects your data: local-first encrypted storage, optional cloud sync, and no third-party tracking.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <GlassCardStrong className="border border-black/10 bg-white/80 text-slate-900">
        <h1 className="text-2xl font-semibold">Privacy Policy &amp; Safety / Liability Disclosures</h1>
        <p className="mt-2 text-sm text-slate-600">Last updated: February 9, 2026</p>
      </GlassCardStrong>

      <GlassCard className="border border-black/10 bg-white/70 text-slate-900">
        <div className="space-y-8 text-sm text-slate-700 leading-relaxed">
          {/* 1) High-importance disclosures */}
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900">Important Disclosures (Read First)</h2>

            <p>
              <strong>Information only — not legal advice.</strong> Pro-Se Prime is an educational, information-only tool
              intended to help users organize information related to New York Family Court Orders of Protection. Pro-Se
              Prime is not a law firm and does not provide legal advice, legal representation, attorney services, or a
              substitute for professional judgment.
            </p>

            <p>
              <strong>No attorney–client relationship; no privilege.</strong> Using the Service, creating a case,
              submitting information, or receiving outputs does not create an attorney–client relationship, fiduciary
              relationship, or any legally protected privilege. Communications through the Service are not privileged and
              may not be confidential.
            </p>

            <p>
              <strong>Not an emergency service.</strong> If you are in immediate danger, call <strong>911</strong> (or your
              local emergency number) immediately. The Service is not designed or monitored for crisis response, safety
              planning, emergency intervention, or time-sensitive protective action.
            </p>

            <p>
              <strong>Outputs may be wrong or incomplete.</strong> Any summaries, scripts, checklists, timelines,
              suggested questions, or “roadmaps” are generated based on the information you provide and automated
              processing. Outputs may contain errors, omissions, assumptions, or misinterpretations, and may be outdated.
              You are solely responsible for verifying accuracy and suitability before using any information in court, in
              communications, or elsewhere.
            </p>

            <p>
              <strong>Use the Service safely.</strong> If you are on a shared device, monitored network, or you are
              concerned someone may access your information, do not use the Service (or use private browsing and clear
              site data afterward). Consider using a trusted device and secure internet connection.
            </p>
          </section>

          {/* 2) What we collect */}
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900">1) Information We Collect</h2>

            <p>We aim to collect the minimum data necessary to operate the Service. Depending on configuration and use, we may collect:</p>

            <div className="space-y-3">
              <p className="font-semibold text-slate-900">A. Information you provide (“User Content”)</p>
              <p>
                You may enter information about your situation (for example: incident details, dates, locations, safety
                concerns, evidence notes, relationship context, and drafting preferences). This information may be
                sensitive.
              </p>
              <p className="text-slate-700">
                <strong>Please do not submit highly sensitive identifiers</strong>, including:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Social Security numbers</li>
                <li>Full financial account numbers</li>
                <li>Full driver’s license numbers</li>
                <li>Full medical records</li>
                <li>Passwords, authentication codes, or private keys</li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="font-semibold text-slate-900">B. Device and technical information</p>
              <p>Like most websites, we may automatically receive:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>IP address (used to estimate <strong>approximate</strong> location, typically city-level)</li>
                <li>Browser type, device type, operating system</li>
                <li>Dates/times of access, pages/actions taken</li>
                <li>Error logs and diagnostic signals</li>
              </ul>
              <p>
                We use this information for security, abuse prevention, debugging, and performance monitoring. We do not
                link approximate location derived from IP to your sensitive User Content as part of core case content.
              </p>
            </div>

            <div className="space-y-3">
              <p className="font-semibold text-slate-900">C. Cookies / local storage</p>
              <p>
                The Service may use browser storage (e.g., localStorage, IndexedDB, session storage) to keep your progress
                and preferences on your device. We may also use cookies or similar technologies for basic functionality,
                security, and (if enabled) analytics.
              </p>
            </div>
          </section>

          {/* 3) Storage + processing */}
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900">2) How Your Data Is Stored</h2>

            <div className="space-y-3">
              <p className="font-semibold text-slate-900">A. Local-first storage (common configuration)</p>
              <p>
                In many configurations, case information is stored locally in your browser on your device. This data is
                encrypted at rest using industry-standard <strong>AES encryption</strong> to help prevent unauthorized
                access by other applications on your device. If you clear browser storage, use private/incognito mode,
                switch devices or browsers, or uninstall the browser/app, your local data may be deleted and unrecoverable.
              </p>
            </div>

            <div className="space-y-3">
              <p className="font-semibold text-slate-900">B. Network requests and server processing</p>
              <p>
                If you use features that require a server request (for example, generating interview questions, summaries,
                or a roadmap), the text you enter may be transmitted to our servers for processing and returned to you.
              </p>
              <p>
                The Service may use third-party providers to generate outputs. These providers process the submitted text
                only to provide the requested feature, subject to their contractual restrictions and this Policy.{" "}
                <strong>We do not permit providers to use your submitted content to train their models.</strong>
              </p>
            </div>

            <div className="space-y-3">
              <p className="font-semibold text-slate-900">C. Shared devices and confidentiality risk</p>
              <p>
                If you use a shared device (or a device accessible by another person), that person may be able to view
                locally stored information. You are responsible for protecting access to your device, browser profile, and
                accounts.
              </p>
            </div>
          </section>

          {/* 4) Use */}
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900">3) How We Use Information</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Provide core functionality (intake, interview flow, generated outputs, saving/displaying your case
                materials).
              </li>
              <li>Maintain security, prevent fraud/abuse, and enforce our Terms.</li>
              <li>Debug issues, monitor reliability, and improve performance.</li>
              <li>Comply with legal obligations and respond to lawful requests.</li>
              <li>Protect the rights, safety, and property of users, the public, and the Service.</li>
            </ul>
            <p>We do not use your information to provide legal advice or representation.</p>
          </section>

          {/* 5) Sharing */}
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900">4) When We Share Information</h2>
            <p>We do not sell your personal information. We may share information only in limited circumstances:</p>

            <div className="space-y-3">
              <p className="font-semibold text-slate-900">A. Service providers</p>
              <p>
                We may use vendors to support hosting, infrastructure, analytics, logging, uptime monitoring, and
                security. These providers may process limited data on our behalf under contractual restrictions and only
                as needed to provide their services.
              </p>
              <p className="text-slate-600">
                For example, analytics may collect technical events (such as page views and performance metrics) and may
                use IP address only to estimate approximate location (typically city-level), and not to identify you or
                attach that location to your sensitive case details.
              </p>
            </div>

            <div className="space-y-3">
              <p className="font-semibold text-slate-900">B. Legal compliance and safety</p>
              <p>
                We may disclose information if we believe disclosure is reasonably necessary to comply with law,
                regulation, subpoena, court order, or legal process; investigate, prevent, or address fraud, abuse,
                security incidents, or technical issues; or protect the rights, safety, or property of users, the public,
                or the Service.
              </p>
            </div>

            <div className="space-y-3">
              <p className="font-semibold text-slate-900">C. Business transfers</p>
              <p>
                If we undergo a merger, acquisition, reorganization, financing, or asset sale, information may be
                transferred as part of that transaction, subject to applicable law and reasonable protections.
              </p>
            </div>
          </section>

          {/* 6) Security */}
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900">5) Security</h2>
            <p>
              We use reasonable administrative, technical, and organizational safeguards intended to protect information.
              However, no method of transmission or storage is 100% secure. You use the Service at your own risk and
              should not submit information you do not want disclosed.
            </p>
          </section>

          {/* 7) Retention */}
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900">6) Data Retention</h2>
            <p>
              We retain information only as long as necessary for the purposes described above, including security,
              dispute resolution, and compliance.
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <strong>Local data</strong> remains on your device until you delete it (for example, by clearing site data).
              </li>
              <li>
                <strong>Server-side data (if any)</strong> may be retained for a limited period for security, debugging,
                and service operation, consistent with this Policy.
              </li>
            </ul>
          </section>

          {/* 8) Children */}
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900">7) Children’s Privacy</h2>
            <p>
              The Service is intended for adults. We do not knowingly collect personal information from children under 13.
              If you believe a child has provided information, contact us and we will take appropriate steps.
            </p>
          </section>

          {/* 9) Choices */}
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900">8) Your Choices and Practical Safety Tips</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>Use a private device and trusted network when possible.</li>
              <li>Consider private browsing and clearing site data afterward.</li>
              <li>Do not include highly sensitive identifiers.</li>
              <li>If you fear monitoring, harassment, or retaliation, prioritize immediate safety and local resources.</li>
              <li>
                If available, use the <strong>Quick Exit</strong> button in the header to immediately navigate away from
                this site if you are interrupted.
              </li>
            </ul>
          </section>

          {/* 10) Liability */}
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900">9) Warranty Disclaimer &amp; Limitation of Liability</h2>

            <p className="font-semibold text-slate-900">As-is; no warranties</p>
            <p>
              THE SERVICE AND ALL CONTENT/OUTPUTS ARE PROVIDED “AS IS” AND “AS AVAILABLE.” TO THE MAXIMUM EXTENT
              PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS, IMPLIED, OR STATUTORY, INCLUDING WARRANTIES OF
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, ACCURACY, AND AVAILABILITY.
            </p>

            <p className="font-semibold text-slate-900">No reliance</p>
            <p>
              You agree not to rely on the Service as a substitute for professional advice or official court guidance. You
              are solely responsible for verifying information and for your decisions, filings, communications, and
              outcomes. The “Roadmap” and “Summary” are organizational aids only and do not constitute a legal strategy or
              a guarantee of any court outcome.
            </p>

            <p className="font-semibold text-slate-900">Limitation of liability</p>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, PRO-SE PRIME AND ITS OWNERS, OPERATORS, CONTRIBUTORS, AND SERVICE
              PROVIDERS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, EXEMPLARY, OR PUNITIVE
              DAMAGES, OR FOR ANY LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR
              RELATING TO YOUR USE OF (OR INABILITY TO USE) THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
              DAMAGES.
            </p>

            <p>
              Some jurisdictions do not allow certain limitations; in those jurisdictions, liability is limited to the
              fullest extent permitted by law.
            </p>

            <p>
              <strong>Terms control.</strong> Additional limitations, dispute-resolution provisions, and other rules may
              appear in the Terms of Service. If there is a conflict between this Policy and the Terms, the Terms govern.
            </p>
          </section>

          {/* 11) Changes */}
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900">10) Changes to This Policy</h2>
            <p>
              We may update this Policy from time to time. The “Last updated” date indicates when changes take effect.
              Continued use of the Service after an update means you accept the revised Policy.
            </p>
          </section>

          {/* 12) Contact */}
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900">11) Contact</h2>
            <p>
              Questions or requests about this Policy:{" "}
              <a href="mailto:support@proseprime.com" className="font-semibold underline underline-offset-4">
                support@proseprime.com
              </a>
            </p>
          </section>
        </div>
      </GlassCard>
    </div>
  );
}
