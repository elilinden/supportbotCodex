"use client";

import { useState, useCallback } from "react";

const SUPPORT_EMAIL = "support@proseprime.org";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const subject = encodeURIComponent(
        `Pro-Se Prime Support${name ? ` — ${name}` : ""}`
      );
      const body = encodeURIComponent(
        [
          message,
          "",
          "---",
          name ? `Name: ${name}` : "",
          email ? `Reply-to: ${email}` : "",
        ]
          .filter(Boolean)
          .join("\n")
      );

      window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
      setSent(true);
    },
    [name, email, message]
  );

  if (sent) {
    return (
      <div className="space-y-3 text-center py-6">
        <p className="text-sm font-semibold text-ui-text">Your email client should have opened.</p>
        <p className="text-xs text-slate-500">
          If it didn&apos;t, email us directly at{" "}
          <a className="underline underline-offset-4" href={`mailto:${SUPPORT_EMAIL}`}>
            {SUPPORT_EMAIL}
          </a>
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-2 text-xs font-semibold text-ui-primary hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
        Send us a message
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="block text-xs font-medium text-slate-700">
            Name <span className="text-slate-400">(optional)</span>
          </label>
          <input
            id="contact-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-ui-primary focus:outline-none focus:ring-1 focus:ring-ui-primary"
            placeholder="Your name"
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="block text-xs font-medium text-slate-700">
            Email <span className="text-slate-400">(optional, for replies)</span>
          </label>
          <input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-ui-primary focus:outline-none focus:ring-1 focus:ring-ui-primary"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-xs font-medium text-slate-700">
          Message <span className="text-ui-danger">*</span>
        </label>
        <textarea
          id="contact-message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-ui-primary focus:outline-none focus:ring-1 focus:ring-ui-primary"
          placeholder="Describe your issue or question. Include your case ID (if applicable), device/browser, and what you expected vs. what happened."
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          className="rounded-full bg-ui-primary px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white hover:opacity-95"
        >
          Open in Email
        </button>
        <p className="text-xs text-slate-400">Opens your default email client</p>
      </div>
    </form>
  );
}
