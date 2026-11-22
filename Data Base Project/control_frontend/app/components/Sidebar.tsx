"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const apiBase =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

const navItems = [
  { id: "employees", label: "Employees", href: "/employees" },
  { id: "clients", label: "Clients", href: "/clients" },
  { id: "projects", label: "Projects", href: "/projects" },
  { id: "tasks", label: "Tasks", href: "/tasks" },
  { id: "summary", label: "Summary", href: "/reports/audit-summary" },
  { id: "reports", label: "Reports", href: "/reports" },
  { id: "health", label: "Health", href: "/health" },
  { id: "session", label: "Session", href: "/session" },
];

const icons: Record<string, JSX.Element> = {
  dashboard: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 12V5a1 1 0 0 1 1-1h6v8H4Z" />
      <path d="M13 20V11h7v8a1 1 0 0 1-1 1h-6Z" />
      <path d="M4 20v-6h7v6H4Z" />
      <path d="M13 9V4h6a1 1 0 0 1 1 1v4h-7Z" />
    </svg>
  ),
  employees: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M16 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
      <path d="M4 20a6 6 0 0 1 16 0" />
    </svg>
  ),
  clients: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M16 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
      <path d="M2 20a6 6 0 0 1 20 0" />
    </svg>
  ),
  projects: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 6h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Z" />
      <path d="M8 6V4h8v2" />
      <path d="M8 12h8" />
    </svg>
  ),
  tasks: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M7 7h10" />
      <path d="M7 12h10" />
      <path d="M7 17h6" />
    </svg>
  ),
  summary: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 19h16" />
      <path d="M7 16V8" />
      <path d="M12 16V5" />
      <path d="M17 16v-3" />
    </svg>
  ),
  reports: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 19h16" />
      <path d="M6 17V9" />
      <path d="M12 17V5" />
      <path d="M18 17v-7" />
    </svg>
  ),
  health: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 21s-7-4.3-7-10a4 4 0 0 1 7-2.4A4 4 0 0 1 19 11c0 5.7-7 10-7 10Z" />
      <path d="M9 12h6" />
      <path d="M12 9v6" />
    </svg>
  ),
  session: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
      <path d="M4 20a8 8 0 0 1 16 0" />
    </svg>
  ),
};

type SidebarProps = {
  active?: string;
};

export default function Sidebar({ active = "employees" }: SidebarProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError(null);
    try {
      const response = await fetch(`${apiBase}/auth/logout`, { method: "POST" });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok) {
        setLogoutError(data?.error || "Unable to logout.");
        return;
      }
      localStorage.removeItem("cv_token");
      router.push("/");
    } catch (err) {
      setLogoutError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <aside className="flex h-full flex-col justify-between rounded-[28px] bg-gradient-to-b from-[#0b1220] via-[#0f172a] to-[#101827] p-6 text-white shadow-[0_30px_60px_rgba(5,10,20,0.5)]">
      <div>
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-500/15 text-sm font-semibold text-emerald-200">
            CV
          </span>
          <div>
            <p className="text-sm font-semibold tracking-[0.22em]">CONTROL_VAULT</p>
            <p className="text-[11px] text-white/60">Admin portal</p>
          </div>
        </div>

        <nav className="mt-8 space-y-2 text-sm">
          {navItems.map((item) => {
            const isActive = item.id === active;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                  isActive
                    ? "bg-emerald-500/15 text-emerald-100 shadow-[inset_0_0_0_1px_rgba(52,211,153,0.25)]"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className={isActive ? "text-emerald-200" : "text-white/80"}>
                  {icons[item.id]}
                </span>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70">
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
        {logoutError ? (
          <p className="mt-3 text-[11px] text-rose-200">{logoutError}</p>
        ) : null}
      </div>
    </aside>
  );
}
