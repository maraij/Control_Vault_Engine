"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";

const apiBase =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

type AuditSummary = {
  employees_added?: number;
  employees_deleted?: number;
  employees_archived?: number;
  clients_added?: number;
  clients_deleted?: number;
  projects_added?: number;
  projects_deleted?: number;
  tasks_added?: number;
  tasks_deleted?: number;
  total_actions?: number;
};

export default function AuditSummaryPage() {
  const [summary, setSummary] = useState<AuditSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const loadSummary = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBase}/reports/audit-today-summary`);
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "Unable to load audit summary.");
      }
      setSummary(data.data ?? data);
      setLastUpdated(new Date().toLocaleTimeString("en-GB"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const cards = [
    {
      title: "Employees",
      items: [
        { label: "Added", value: summary?.employees_added },
        { label: "Deleted", value: summary?.employees_deleted },
        { label: "Archived", value: summary?.employees_archived },
      ],
    },
    {
      title: "Clients",
      items: [
        { label: "Added", value: summary?.clients_added },
        { label: "Deleted", value: summary?.clients_deleted },
      ],
    },
    {
      title: "Projects",
      items: [
        { label: "Added", value: summary?.projects_added },
        { label: "Deleted", value: summary?.projects_deleted },
      ],
    },
    {
      title: "Tasks",
      items: [
        { label: "Added", value: summary?.tasks_added },
        { label: "Deleted", value: summary?.tasks_deleted },
      ],
    },
  ];

  const toNumber = (value: number | undefined) => {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return null;
    }
    return value;
  };

  const sumNumbers = (values: Array<number | null>) => {
    const numeric = values.filter((value): value is number => typeof value === "number");
    if (!numeric.length) return null;
    return numeric.reduce((acc, value) => acc + value, 0);
  };

  const chartSeries = [
    {
      label: "Employees",
      value: toNumber(summary?.employees_added),
      color: "from-blue-500 to-cyan-400",
    },
    {
      label: "Clients",
      value: toNumber(summary?.clients_added),
      color: "from-emerald-500 to-lime-400",
    },
    {
      label: "Projects",
      value: toNumber(summary?.projects_added),
      color: "from-amber-500 to-orange-400",
    },
    {
      label: "Tasks",
      value: toNumber(summary?.tasks_added),
      color: "from-rose-500 to-pink-400",
    },
  ];
  const numericChartValues = chartSeries
    .map((item) => item.value)
    .filter((value): value is number => typeof value === "number");
  const maxValue = Math.max(1, ...numericChartValues);
  const entityMix = [
    {
      label: "Employees",
      added: toNumber(summary?.employees_added),
      deleted: toNumber(summary?.employees_deleted),
      archived: toNumber(summary?.employees_archived),
    },
    {
      label: "Clients",
      added: toNumber(summary?.clients_added),
      deleted: toNumber(summary?.clients_deleted),
      archived: null,
    },
    {
      label: "Projects",
      added: toNumber(summary?.projects_added),
      deleted: toNumber(summary?.projects_deleted),
      archived: null,
    },
    {
      label: "Tasks",
      added: toNumber(summary?.tasks_added),
      deleted: toNumber(summary?.tasks_deleted),
      archived: null,
    },
  ];
  const visibleEntityMix = entityMix.filter(
    (item) => item.added !== null || item.deleted !== null || item.archived !== null
  );
  const visibleChartSeries = chartSeries.filter((item) => item.value !== null);
  const visibleCards = cards
    .map((card) => ({
      ...card,
      items: card.items.filter((item) => item.value !== null),
    }))
    .filter((card) => card.items.length > 0);
  const showActionMix = isLoading || visibleEntityMix.length > 0;
  const showAddsHeat = isLoading || visibleChartSeries.length > 0;
  const showTiles = isLoading || visibleCards.length > 0;

  return (
    <div className="login-shell min-h-screen">
      <div className="dot-grid min-h-screen px-3 py-4 md:px-6 md:py-6 lg:px-0 lg:py-0">
        <div className="mx-auto grid w-full max-w-none gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-stretch lg:gap-0">
          <div className="lg:sticky lg:top-0 lg:h-screen lg:py-0">
            <Sidebar active="summary" />
          </div>

          <main className="min-h-screen rounded-[28px] bg-white/95 p-6 shadow-[0_30px_60px_rgba(15,23,42,0.12)] backdrop-blur lg:my-0 lg:mr-4">
            <header className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-800 p-6 text-white shadow-sm">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute -left-20 top-10 h-48 w-48 rounded-full bg-emerald-400 blur-3xl" />
                <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-400 blur-3xl" />
              </div>
              <div>
                <p className="relative text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                  Audit Overview
                </p>
                <h1 className="relative mt-2 font-display text-3xl text-white">
                  Today&apos;s Audit Summary
                </h1>
                <p className="relative mt-2 text-sm text-emerald-100/80">
                  Live rollup of today&apos;s add/delete/archive events.
                </p>
              </div>
              <div className="relative mt-4 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                  {isLoading ? "Syncing..." : "Live data"}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                  Updated: {lastUpdated ?? "--:--"}
                </span>
              </div>
            </header>

            {error ? (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
                {error}
              </div>
            ) : null}

            {showActionMix || showAddsHeat ? (
              <section className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                  Action Mix
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Adds, deletes, and archive distribution by entity.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Added
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-rose-400" />
                    Deleted
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    Archived
                  </span>
                </div>
                <div className="mt-5 grid gap-4">
                  {visibleEntityMix.map((item) => {
                    const total = sumNumbers([
                      item.added,
                      item.deleted,
                      item.archived,
                    ]);
                    if (total === null) {
                      return null;
                    }

                    const safeTotal = total === 0 ? 1 : Math.max(1, total);
                    const addedWidth = Math.round(((item.added ?? 0) / safeTotal) * 100);
                    const deletedWidth = Math.round(((item.deleted ?? 0) / safeTotal) * 100);
                    const archivedWidth = Math.max(0, 100 - addedWidth - deletedWidth);
                    return (
                      <div key={item.label} className="grid gap-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                          <span>{item.label}</span>
                          <span>
                            {isLoading ? "..." : `${total} actions`}
                          </span>
                        </div>
                        <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full bg-emerald-400"
                            style={{ width: `${isLoading ? 20 : addedWidth}%` }}
                          />
                          <div
                            className="h-full bg-rose-400"
                            style={{ width: `${isLoading ? 20 : deletedWidth}%` }}
                          />
                          <div
                            className="h-full bg-amber-400"
                            style={{ width: `${isLoading ? 20 : archivedWidth}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
                  Adds Heat
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Visual snapshot of today&apos;s created records.
                </p>
                <div className="mt-5 grid gap-4">
                  {visibleChartSeries.map((item) => {
                    const width = Math.round(((item.value ?? 0) / maxValue) * 100);
                    return (
                      <div key={item.label} className="grid gap-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                          <span>{item.label}</span>
                          <span>
                            {isLoading ? "..." : item.value}
                          </span>
                        </div>
                        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                            style={{ width: `${isLoading ? 20 : width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
            ) : null}

            {showTiles ? (
              <section className="mt-6 grid gap-4 lg:grid-cols-2">
              {visibleCards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.28em] ${
                      card.title === "Employees"
                        ? "border-blue-100 bg-blue-50 text-blue-700"
                        : card.title === "Clients"
                        ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                        : card.title === "Projects"
                        ? "border-amber-100 bg-amber-50 text-amber-700"
                        : "border-rose-100 bg-rose-50 text-rose-700"
                    }`}
                  >
                    {card.title}
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {card.items.map((item) => (
                      <div
                        key={`${card.title}-${item.label}`}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                      >
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                          {item.label}
                        </p>
                        <p className="mt-2 text-xl font-semibold text-slate-900">
                          {isLoading ? "..." : item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </section>
            ) : null}
          </main>
        </div>
      </div>
    </div>
  );
}
