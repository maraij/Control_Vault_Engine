"use client";

import Link from "next/link";
import { useState } from "react";
import Sidebar from "../../components/Sidebar";

const apiBase =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export default function EmployeeArchivePage() {
  const [archiveEmpId, setArchiveEmpId] = useState("");
  const [archiveReason, setArchiveReason] = useState("");
  const [restoreId, setRestoreId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleArchive = async () => {
    setError(null);
    setSuccess(null);
    if (!archiveEmpId.trim()) {
      setError("Employee ID is required.");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        emp_id: archiveEmpId.trim(),
      };
      if (archiveReason.trim()) {
        payload.reason = archiveReason.trim();
      }
      const response = await fetch(`${apiBase}/employees/archive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok) {
        setError(data?.error || "Unable to archive employee.");
        return;
      }
      setSuccess("Archive request completed.");
      setArchiveEmpId("");
      setArchiveReason("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestore = async () => {
    if (!restoreId.trim()) {
      setError("Backup ID is required.");
      return;
    }
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiBase}/employees/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ backup_id: restoreId }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok) {
        setError(data?.error || "Unable to restore employee.");
        return;
      }
      setSuccess("Restore request completed.");
      setRestoreId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-shell min-h-screen">
      <div className="dot-grid min-h-screen px-3 py-4 md:px-6 md:py-6 lg:px-0 lg:py-0">
        <div className="mx-auto grid w-full max-w-none gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-stretch lg:gap-0">
          <div className="lg:sticky lg:top-0 lg:h-screen lg:py-0">
            <Sidebar active="employees" />
          </div>

          <main className="min-h-screen rounded-[28px] bg-white/95 p-6 shadow-[0_30px_60px_rgba(15,23,42,0.12)] backdrop-blur lg:my-0 lg:mr-4">
            <header className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-amber-700 p-6 text-white shadow-sm">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute -left-16 top-10 h-44 w-44 rounded-full bg-amber-400 blur-3xl" />
                <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-orange-400 blur-3xl" />
              </div>
              <div className="relative flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
                    Employee Archive
                  </p>
                  <h1 className="font-display text-3xl text-white">
                    Archive & Restore
                  </h1>
                </div>
                <Link
                  href="/employees"
                  className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-white/20"
                >
                  Back to Employees
                </Link>
              </div>
            </header>

            {error ? (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
                {error}
              </div>
            ) : null}
            {success ? (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">
                {success}
              </div>
            ) : null}

            <section className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Archive Employee
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Mark an employee as archived with an optional reason for audit.
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <input
                    value={archiveEmpId}
                    onChange={(event) => setArchiveEmpId(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none"
                    placeholder="Employee ID"
                  />
                  <input
                    value={archiveReason}
                    onChange={(event) => setArchiveReason(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none"
                    placeholder="Reason (optional)"
                  />
                </div>
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
                  Archived records can be restored later from backup history.
                </div>
                <button
                  type="button"
                  className="mt-4 w-full rounded-2xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white"
                  onClick={handleArchive}
                  disabled={isSubmitting}
                >
                  Archive
                </button>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Restore Employee
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Use the backup ID generated at archive time to restore records.
                </p>
                <input
                  value={restoreId}
                  onChange={(event) => setRestoreId(event.target.value)}
                  className="mt-4 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none"
                  placeholder="Backup ID"
                />
                <button
                  type="button"
                  className="mt-4 w-full rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                  onClick={handleRestore}
                  disabled={isSubmitting}
                >
                  Restore
                </button>
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
                  Restores return the employee to active status without losing history.
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
