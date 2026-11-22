"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const apiBase =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.ok) {
        setError(data?.message || data?.error || "Login failed.");
        return;
      }

      const token =
        data?.token ?? data?.data?.token ?? data?.session?.token ?? null;
      if (token) {
        localStorage.setItem("cv_token", token);
      }
      router.push("/employees");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to reach the server.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-shell min-h-screen">
      <div className="dot-grid login-aurora min-h-screen px-6 py-6 md:px-10">
        <header className="flex items-center justify-between text-slate-200">
          <div className="flex items-center gap-3 text-sm font-semibold tracking-[0.2em]">
            <span className="h-9 w-9 rounded-2xl bg-white/10 text-white grid place-items-center text-base">
              CV
            </span>
            CONTROL_VAULT
          </div>
          <button className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-slate-100 shadow-sm transition hover:border-white/40 hover:bg-white/20">
            Support
          </button>
        </header>

        <main className="mx-auto flex min-h-[calc(100vh-120px)] max-w-5xl items-center justify-center">
          <section className="glass-card relative w-full max-w-md rounded-[28px] p-8">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="h-14 w-14 rounded-2xl bg-[color:var(--app-primary-soft)] text-[color:var(--app-primary)] grid place-items-center shadow-[0_12px_24px_rgba(31,75,153,0.2)]">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M17 10V7a5 5 0 0 0-10 0v3" />
                  <rect x="5" y="10" width="14" height="10" rx="2" />
                </svg>
              </div>
              <div>
                <p className="font-display text-2xl text-slate-900">
                  Admin Portal
                </p>
                <p className="text-sm text-slate-500">Secure admin access</p>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Vault online
                </div>
              </div>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Username or Admin ID
                </label>
                <input
                  type="text"
                  placeholder="Enter your ID"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  name="username"
                  autoComplete="username"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[color:var(--app-primary)] focus:ring-2 focus:ring-[color:var(--app-primary-soft)]"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  <span>Secure password</span>
                  <button className="text-[color:var(--app-primary)] transition hover:text-slate-900">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    name="password"
                    autoComplete="current-password"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[color:var(--app-primary)] focus:ring-2 focus:ring-[color:var(--app-primary-soft)]"
                  />
                  <span className="pointer-events-none absolute right-4 top-3 text-slate-400">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M1.5 12s4.5-6 10.5-6 10.5 6 10.5 6-4.5 6-10.5 6S1.5 12 1.5 12Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </span>
                </div>
              </div>
              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
                  {error}
                </div>
              ) : null}
              <button
                type="submit"
                disabled={isSubmitting}
                className="scanline w-full rounded-2xl py-3 text-sm font-semibold text-white shadow-[0_18px_30px_rgba(31,75,153,0.28)] transition hover:translate-y-[-1px] hover:shadow-[0_22px_40px_rgba(31,75,153,0.32)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Logging in..." : "Login to Dashboard"}
              </button>
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Authorized personnel only • 256-bit AES
              </div>
              <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                <span>Session lock 120s</span>
                <span>Biometric ready</span>
              </div>
            </form>
          </section>
        </main>

        <footer className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
          <div className="flex gap-4">
            <button className="hover:text-white">Privacy Policy</button>
            <button className="hover:text-white">Security Audit</button>
            <button className="hover:text-white">System Status</button>
          </div>
          <span className="text-slate-400">© 2024 CONTROL_VAULT INC.</span>
        </footer>
      </div>
    </div>
  );
}
