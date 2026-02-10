import { GlassCard, GlassCardStrong } from "@/components/GlassCard";

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
              <strong>Information only — not legal advice.</strong> Pro-Se Prime is an educational, information-only
              tool designed to help users organize information related to New York Family Court Orders of Protection.
              It does not provide legal advice, legal representation, or legal services.
            </p>
            <p>
              <strong>No attorney-client relationship.</strong> Using this site, submitting information, or receiving
              output does not create an attorney-client relationship or any fiduciary relationship. Do not rely on this
              tool as a substitute for advice from a qualified attorney.
            </p>
            <p>
              <strong>Emergency / safety.</strong> If you are in immediate danger, call <strong>911</strong> (or your
              local emergency number). This site is not an emergency service and is not monitored for urgent requests.
            </p>
            <p>
              <strong>Outputs may be incomplete or inaccurate.</strong> Any summaries, checklists, scripts, or “roadmaps”
              are generated from the information you provide and may contain errors, omissions, or assumptions. You are
              solely responsible for verifying accuracy before using any information in court or elsewhere.
            </p>
          </section>

          {/* 2) What we collect */}
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900">Information We Collect</h2>
            <p>
              We aim to collect the minimum data needed to provide the site’s functionality. The categories below may
              apply depending on how your deployment is configured.
            </p>

            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Information you enter.</strong> You may type case-related information (e.g., incident dates,
                locations, safety concerns, evidence notes). This may be sensitive. Please avoid entering Social Security
                numbers, complete financial account numbers, or other highly sensitive identifiers.
              </li>
              <li>
                <strong>Basic technical data.</strong> Like most websites, servers may receive basic log data (e.g., IP
                address, browser type, timestamps) for security, debugging, and performance.
              </li>
              <li>
                <strong>Cookies / local storage.</strong> The app may use browser storage (e.g., localStorage or indexedDB)
                to keep your progress on your device.
              </li>
            </ul>
          </section>

          {/* 3) Local-first + storage */}
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900">How Your Data Is Stored</h2>
            <p>
              <strong>Local-first by default.</strong> In many configurations, your case information is stored locally in
              your browser on your device. If you clear your browser storage, use private/incognito mode, switch devices,
              or uninstall the browser/app, your local data may be deleted and unrecoverable.
            </p>
            <p>
              <strong>Network requests.</strong> When you use features that call our API (for example, generating questions
              or summaries), your entered text may be transmitted to our servers for processing and then returned to you.
            </p>
            <p>
              <strong>No guarantee of confidentiality on shared devices.</strong> If you use a shared computer or device,
              others may be able to access your browser-stored information. Use caution, consider private browsing, and
              log out of any device accounts as needed.
            </p>
          </section>

          {/* 4) How we use data */}
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900">How We Use Information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Provide core functionality (intake, interviewing, summaries, roadmaps, checklists).</li>
              <li>Maintain security, prevent abuse, debug issues, and improve performance and reliability.</li>
              <li>Comply with applicable laws, enforce our Terms, and protect rights, safety, and property.</li>
            </ul>
          </section>

          {/* 5) Sharing */}
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900">When We Share Information</h2>
            <p>We do not sell personal information. We may share information in limited situations:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Service providers.</strong> Vendors who help operate the site (hosting, analytics, error logging,
                infrastructure) may process limited data on our behalf under contractual restrictions.
              </li>
              <li>
                <strong>Legal and safety.</strong> If required by law, legal process, or to protect rights, safety, and
                security (for example, to address fraud, abuse, or threats).
              </li>
              <li>
                <strong>Business changes.</strong> In a merger, acquisition, financing, reorganization, or asset sale,
                information may be transferred as part of that transaction subject to applicable law.
              </li>
            </ul>
          </section>

          {/* 6) Security */}
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900">Security</h2>
            <p>
              We use reasonable administrative, technical, and organizational safeguards intended to protect information.
              However, no system can be guaranteed 100% secure. You are responsible for using the site in a safe manner
              and for not entering information you do not want disclosed.
            </p>
          </section>

          {/* 7) Retention */}
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900">Data Retention</h2>
            <p>
              We retain information only as long as necessary for the purposes described in this policy, including
              security, dispute resolution, and legal compliance. Local browser-stored information remains on your device
              until you delete it (e.g., clearing site data).
            </p>
          </section>

          {/* 8) Children */}
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900">Children’s Privacy</h2>
            <p>
              This site is intended for adults. We do not knowingly collect personal information from children under 13.
              If you believe a child has provided information, contact us so we can address it.
            </p>
          </section>

          {/* 9) Liability + warranty disclaimers */}
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900">Warranty Disclaimer &amp; Limitation of Liability</h2>
            <p>
              <strong>As-is.</strong> The site and all content are provided on an “AS IS” and “AS AVAILABLE” basis without
              warranties of any kind, whether express, implied, or statutory, including implied warranties of
              merchantability, fitness for a particular purpose, and non-infringement.
            </p>
            <p>
              <strong>No reliance.</strong> You agree not to rely on the site as a substitute for professional advice.
              You are solely responsible for your decisions, filings, and outcomes.
            </p>
            <p>
              <strong>Limitation.</strong> To the maximum extent permitted by law, Pro-Se Prime and its owners, operators,
              contributors, and service providers will not be liable for any indirect, incidental, consequential, special,
              exemplary, or punitive damages, or for any loss of profits, data, goodwill, or other intangible losses,
              arising out of or relating to your use of (or inability to use) the site, even if advised of the possibility
              of such damages.
            </p>
            <p>
              <strong>Terms control.</strong> Additional limitations and dispute-resolution provisions may appear in our
              Terms of Service. If there is a conflict between this page and the Terms, the Terms govern.
            </p>
          </section>

          {/* 10) Changes */}
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900">Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. The “Last updated” date above indicates when changes take
              effect. Your continued use of the site after an update means you accept the revised policy.
            </p>
          </section>

          {/* 11) Contact */}
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900">Contact</h2>
            <p>
              Questions or requests about this policy can be sent to:{" "}
              <a href="mailto:support@proseprime.com" className="font-semibold underline underline-offset-4">support@proseprime.com</a>
            </p>
          </section>
        </div>
      </GlassCard>
    </div>
  );
}