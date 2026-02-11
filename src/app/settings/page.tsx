"use client";

import { useState } from "react";
import Link from "next/link";
import { GlassCard, GlassCardStrong } from "@/components/GlassCard";
import { useCaseStore } from "@/store/useCaseStore";
import { exportCaseData, wipeCaseData } from "@/lib/encryption";
import { useAuthStore } from "@/store/useAuthStore";
import { cloudSave, cloudRestore } from "@/lib/cloudSync";
import { AuthModal } from "@/components/AuthModal";

export default function SettingsPage() {
  const caseCount = useCaseStore((state) => state.cases.length);
  const activeCaseId = useCaseStore((state) => state.activeCaseId);
  const activeCase = useCaseStore((state) =>
    state.cases.find((item) => item.id === state.activeCaseId)
  );
  const clearAll = useCaseStore((state) => state.clearAll);

  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);
  const signOut = useAuthStore((s) => s.signOut);

  const [authOpen, setAuthOpen] = useState(false);
  const [syncMsg, setSyncMsg] = useState<{ text: string; type: "ok" | "err" } | null>(null);
  const [syncing, setSyncing] = useState(false);

  const handleWipe = () => {
    if (window.confirm("This will permanently delete all case data. Are you sure?")) {
      clearAll();
      wipeCaseData();
    }
  };

  const handleCloudSave = async () => {
    if (!user) return;
    setSyncing(true);
    setSyncMsg(null);
    const { error } = await cloudSave(user.id);
    setSyncing(false);
    setSyncMsg(error ? { text: error, type: "err" } : { text: "Saved to cloud.", type: "ok" });
  };

  const handleCloudRestore = async () => {
    if (!user) return;
    if (!window.confirm("This will replace all local data with your cloud backup. Continue?")) return;
    setSyncing(true);
    setSyncMsg(null);
    const { error } = await cloudRestore(user.id);
    // cloudRestore reloads the page on success, so we only reach here on error
    setSyncing(false);
    if (error) setSyncMsg({ text: error, type: "err" });
  };

  return (
    <div className="space-y-8">
      <GlassCardStrong className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-ui-textMuted">Settings</p>
        <h1 className="text-2xl font-semibold text-ui-text">Workspace Settings</h1>
        <p className="text-sm text-ui-textMuted">
          Settings are stored locally in your browser. This is a NY Family Court Order of Protection workspace.
        </p>
      </GlassCardStrong>

      {/* ---- Account & Cloud Sync ---- */}
      <GlassCard className="space-y-4">
        <h2 className="text-sm font-semibold text-ui-text">Account & Cloud Sync</h2>

        {authLoading ? (
          <p className="text-xs text-ui-textMuted">Loading...</p>
        ) : user ? (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-ui-textMuted">
                Signed in as <span className="font-semibold text-ui-text">{user.email}</span>
              </span>
              <button
                onClick={() => signOut()}
                className="rounded-full border border-ui-border bg-ui-surface px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ui-text shadow-sm hover:bg-ui-surface2"
              >
                Sign Out
              </button>
            </div>

            <p className="text-xs text-ui-textMuted">
              Your data is encrypted before leaving this device. The server only stores an opaque encrypted blob.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleCloudSave}
                disabled={syncing}
                className="rounded-full bg-ui-primary px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:opacity-95 disabled:opacity-60"
              >
                {syncing ? "Syncing..." : "Save to Cloud"}
              </button>
              <button
                onClick={handleCloudRestore}
                disabled={syncing}
                className="rounded-full border border-ui-border bg-ui-surface px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ui-text shadow-sm hover:bg-ui-surface2 disabled:opacity-60"
              >
                {syncing ? "Syncing..." : "Restore from Cloud"}
              </button>
            </div>

            {syncMsg && (
              <p
                className={`rounded-xl border px-3 py-2 text-xs ${
                  syncMsg.type === "ok"
                    ? "border-ui-success/30 bg-ui-successSoft text-ui-success"
                    : "border-ui-danger/30 bg-ui-dangerSoft text-ui-danger"
                }`}
              >
                {syncMsg.text}
              </p>
            )}
          </>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-ui-textMuted">
              Sign in to back up your encrypted case data to the cloud. Your data is encrypted on-device before upload — the server never sees plaintext.
            </p>
            <button
              onClick={() => setAuthOpen(true)}
              className="rounded-full border border-ui-primary bg-ui-primarySoft px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ui-primary hover:opacity-90"
            >
              Sign In or Create Account
            </button>
          </div>
        )}
      </GlassCard>

      {/* ---- Local Data Storage ---- */}
      <GlassCard className="space-y-4">
        <h2 className="text-sm font-semibold text-ui-text">Data storage</h2>
        <p className="text-xs text-ui-textMuted">Saved cases: {caseCount}</p>

        <div className="flex flex-wrap gap-3">
          <button
            className="rounded-full border border-ui-border bg-ui-surface px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ui-text shadow-sm hover:bg-ui-surface2"
            onClick={exportCaseData}
          >
            Export data (JSON)
          </button>

          <button
            className="rounded-full border border-ui-danger/30 bg-ui-dangerSoft px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ui-danger hover:opacity-90"
            onClick={handleWipe}
          >
            Delete all local data
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          {caseCount === 0 ? (
            <Link
              className="rounded-full border border-ui-border bg-ui-surface px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ui-text shadow-sm hover:bg-ui-surface2"
              href="/new"
            >
              Start New Intake
            </Link>
          ) : null}

          {activeCaseId ? (
            <Link
              className="rounded-full border border-ui-border bg-ui-surface px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ui-text shadow-sm hover:bg-ui-surface2"
              href={
                activeCase?.status === "interview"
                  ? `/case/${activeCaseId}/interview`
                  : `/case/${activeCaseId}/roadmap`
              }
            >
              View Dashboard
            </Link>
          ) : null}
        </div>
      </GlassCard>

      <GlassCard className="space-y-3">
        <h2 className="text-sm font-semibold text-ui-text">Safety reminder</h2>
        <div className="rounded-2xl border border-ui-warning/30 bg-ui-warningSoft p-4 text-xs text-ui-text">
          If you are in immediate danger, call 911 or your local emergency number. This tool does not
          replace professional support.
        </div>
      </GlassCard>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </div>
  );
}
