"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

const apiBase =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export default function HealthPage() {
  const [health, setHealth] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHealth = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBase}/health`);
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.error || "Health check failed.");
        return;
      }
      setHealth(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHealth();
  }, []);

  return (
    <div className="login-shell min-h-screen">
      <div className="dot-grid min-h-screen px-3 py-4 md:px-6 md:py-6 lg:px-0 lg:py-0">
        <div className="mx-auto grid w-full max-w-none gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-stretch lg:gap-0">
          <div className="lg:sticky lg:top-0 lg:h-screen lg:py-0">
            <Sidebar active="health" />
          </div>

          <main className="min-h-screen rounded-[28px] bg-white/95 p-6 shadow-[0_30px_60px_rgba(15,23,42,0.12)] backdrop-blur lg:my-0 lg:mr-4">
            <header className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-700 p-6 text-white shadow-sm">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute -left-16 top-10 h-44 w-44 rounded-full bg-emerald-400 blur-3xl" />
                <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-lime-400 blur-3xl" />
              </div>
              <div className="relative flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                    System Health
                  </p>
                  <h1 className="font-display text-3xl text-white">
                    Health Check
                  </h1>
                </div>
                <button
                  className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-white/20"
                  onClick={loadHealth}
                  type="button"
                >
                  Refresh
                </button>
              </div>
            </header>

            {error ? (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
                {error}
              </div>
            ) : null}

            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Status
              </p>
              <pre className="mt-3 max-h-80 overflow-auto rounded-2xl bg-slate-50 p-4 text-xs text-slate-600">
                {isLoading ? "Loading..." : JSON.stringify(health, null, 2)}
              </pre>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
