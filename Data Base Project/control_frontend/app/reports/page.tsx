"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

const apiBase =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

type ReportState = {
  performance: unknown;
  performanceSummary: unknown;
  auditToday: unknown;
  activeEmployees: unknown;
};

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportState>({
    performance: null,
    performanceSummary: null,
    auditToday: null,
    activeEmployees: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [
        performanceRes,
        summaryRes,
        auditRes,
        activeRes,
      ] = await Promise.all([
        fetch(`${apiBase}/reports/performance`),
        fetch(`${apiBase}/reports/performance-summary`),
        fetch(`${apiBase}/reports/audit-today`),
        fetch(`${apiBase}/reports/active-employees`),
      ]);

      const performance = await performanceRes.json().catch(() => null);
      const performanceSummary = await summaryRes.json().catch(() => null);
      const auditToday = await auditRes.json().catch(() => null);
      const activeEmployees = await activeRes.json().catch(() => null);

      if (!performanceRes.ok || !performance?.ok) {
        throw new Error(performance?.error || "Unable to load performance report.");
      }
      if (!summaryRes.ok || !performanceSummary?.ok) {
        throw new Error(
          performanceSummary?.error || "Unable to load performance summary."
        );
      }
      if (!auditRes.ok || !auditToday?.ok) {
        throw new Error(auditToday?.error || "Unable to load audit report.");
      }
      if (!activeRes.ok || !activeEmployees?.ok) {
        throw new Error(activeEmployees?.error || "Unable to load active employees report.");
      }

      setReports({
        performance: performance.data ?? performance,
        performanceSummary: performanceSummary.data ?? performanceSummary,
        auditToday: auditToday.data ?? auditToday,
        activeEmployees: activeEmployees.data ?? activeEmployees,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const getAuditValue = (key: string) => {
    if (!reports.auditToday) {
      return null;
    }
    if (Array.isArray(reports.auditToday)) {
      const row = reports.auditToday[0] as Record<string, unknown> | undefined;
      return row?.[key] ?? null;
    }
    if (typeof reports.auditToday === "object") {
      return (reports.auditToday as Record<string, unknown>)[key] ?? null;
    }
    return null;
  };

  const activeEmployeesCount = Array.isArray(reports.activeEmployees)
    ? reports.activeEmployees.length
    : 0;

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <div className="login-shell min-h-screen">
      <div className="dot-grid min-h-screen px-3 py-4 md:px-6 md:py-6 lg:px-0 lg:py-0">
        <div className="mx-auto grid w-full max-w-none gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-stretch lg:gap-0">
          <div className="lg:sticky lg:top-0 lg:h-screen lg:py-0">
            <Sidebar active="reports" />
          </div>

          <main className="min-h-screen rounded-[28px] bg-white/95 p-6 shadow-[0_30px_60px_rgba(15,23,42,0.12)] backdrop-blur lg:my-0 lg:mr-4">
            <header className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-800 p-6 text-white shadow-sm">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute -left-20 top-8 h-48 w-48 rounded-full bg-emerald-400 blur-3xl" />
                <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-400 blur-3xl" />
              </div>
              <div className="relative flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                    Control Vault Reporting Suite
                  </p>
                  <h1 className="font-display text-3xl text-white">
                    Performance Reports
                  </h1>
                  <p className="text-sm text-emerald-100/80">
                    Vault / Reports Suite
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <input
                      type="search"
                      placeholder="Search employees or metrics..."
                      className="w-64 rounded-2xl border border-white/20 bg-white/90 px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-white/40 focus:ring-2 focus:ring-white/30"
                    />
                    <span className="pointer-events-none absolute right-3 top-2.5 text-slate-400">
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      >
                        <circle cx="11" cy="11" r="7" />
                        <path d="m20 20-3.5-3.5" />
                      </svg>
                    </span>
                  </div>
                  <button
                    className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-white/20"
                    onClick={loadReports}
                    type="button"
                  >
                    Refresh Data
                  </button>
                </div>
              </div>
              <div className="relative mt-4 grid gap-3 md:grid-cols-3">
                {[
                  { label: "Summary", value: "Performance Summary" },
                  { label: "Sync Status", value: "Live sync enabled" },
                  { label: "Scope", value: "Employee throughput" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-100/70">
                      {item.label}
                    </p>
                    <p className="text-sm font-semibold text-white">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </header>

            {error ? (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
                {error}
              </div>
            ) : null}

            <div className="mt-6 grid gap-4 lg:grid-cols-[2.2fr_1fr]">
              <section className="rounded-3xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Performance Summary
                    </p>
                    <p className="text-sm text-slate-500">
                      Tasks, projects, and client coverage per employee.
                    </p>
                  </div>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Live sync enabled
                  </span>
                </div>
                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                  <div className="grid grid-cols-[minmax(0,1fr)_140px_140px_140px_120px] bg-slate-50 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    <span>Employee</span>
                    <span>Tasks</span>
                    <span>Active</span>
                    <span>Completed</span>
                    <span>Clients</span>
                  </div>
                  {isLoading ? (
                    <div className="px-4 py-6 text-sm text-slate-500">
                      Loading...
                    </div>
                  ) : Array.isArray(reports.performanceSummary) &&
                    reports.performanceSummary.length ? (
                    (reports.performanceSummary as Array<Record<string, unknown>>).map(
                      (row, index) => (
                        <div
                          key={`${row.emp_id ?? "emp"}-${index}`}
                          className="grid grid-cols-[minmax(0,1fr)_140px_140px_140px_120px] items-center border-t border-slate-200 px-4 py-3 text-sm text-slate-600"
                        >
                          <span className="font-semibold text-slate-800">
                            {String(row.full_name ?? row.emp_id ?? "Employee")}
                          </span>
                          <span className="font-semibold text-slate-700">
                            {String(row.tasks_done_today ?? "-")}
                          </span>
                          <span>{String(row.active_projects ?? "-")}</span>
                          <span>{String(row.completed_projects ?? "-")}</span>
                          <span>{String(row.clients_count ?? "-")}</span>
                        </div>
                      )
                    )
                  ) : (
                    <div className="px-4 py-6 text-sm text-slate-500">
                      No performance summary data available.
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Snapshot
                </p>
                <div className="mt-4 grid gap-4">
                  {[
                    {
                      label: "Top Throughput",
                      value: Array.isArray(reports.performanceSummary)
                        ? reports.performanceSummary.length
                          ? String(
                              reports.performanceSummary[0]?.full_name ??
                                reports.performanceSummary[0]?.emp_id ??
                                "—"
                            )
                          : "—"
                        : "—",
                      hint: "Highest visible entry",
                    },
                    {
                      label: "Active Team",
                      value: Array.isArray(reports.performanceSummary)
                        ? reports.performanceSummary.length
                        : 0,
                      hint: "Employees reporting",
                    },
                    {
                      label: "Client Load",
                      value: Array.isArray(reports.performanceSummary)
                        ? reports.performanceSummary.reduce((sum, row) => {
                            const count = Number(row?.clients_count ?? 0);
                            return sum + (Number.isFinite(count) ? count : 0);
                          }, 0)
                        : 0,
                      hint: "Total managed clients",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        {item.label}
                      </p>
                      <div className="mt-2 text-xl font-semibold text-slate-900">
                        {isLoading ? "..." : item.value}
                      </div>
                      <p className="text-xs text-slate-500">{item.hint}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {[
                {
                  title: "Audit Today",
                  value: getAuditValue("employees_added_today") ?? "—",
                  caption: "Employees added",
                },
                {
                  title: "Archive Events",
                  value: getAuditValue("employees_archived_today") ?? "—",
                  caption: "Archived today",
                },
                {
                  title: "Active Employees",
                  value: isLoading ? "..." : activeEmployeesCount,
                  caption: "Currently active",
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    {card.title}
                  </p>
                  <div className="mt-3 text-2xl font-semibold text-slate-900">
                    {card.value}
                  </div>
                  <p className="text-xs text-slate-500">{card.caption}</p>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
