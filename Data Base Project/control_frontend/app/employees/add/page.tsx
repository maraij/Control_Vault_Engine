"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const apiBase =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export default function AddEmployeePage() {
  const router = useRouter();
  const [formState, setFormState] = useState({
    emp_id: "",
    full_name: "",
    department: "",
    join_date: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const parsedId = Number(formState.emp_id);
      const payload = {
        full_name: formState.full_name,
        department: formState.department,
        join_date: formState.join_date,
        ...(Number.isFinite(parsedId) ? { emp_id: parsedId } : {}),
      };
      const response = await fetch(`${apiBase}/employees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok) {
        setError(data?.error || "Unable to add employee.");
        return;
      }
      router.push("/employees");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="login-shell min-h-screen">
      <div className="dot-grid min-h-screen px-4 py-8">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-2xl items-center justify-center">
          <div className="overflow-hidden rounded-3xl bg-white/95 shadow-[0_30px_80px_rgba(15,23,42,0.3)] backdrop-blur">
            <div className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-800 p-6 text-white">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute -left-12 top-6 h-32 w-32 rounded-full bg-emerald-400 blur-3xl" />
                <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-cyan-400 blur-3xl" />
              </div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                    Add Employee
                  </p>
                  <h1 className="text-2xl font-semibold text-white">
                    Register a new employee
                  </h1>
                </div>
                <Link
                  href="/employees"
                  className="rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-white/20"
                >
                  Back
                </Link>
              </div>
            </div>

            <div className="p-8">
              {error ? (
                <div className="mt-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
                  {error}
                </div>
              ) : null}

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Employee ID
                </label>
                <input
                  value={formState.emp_id}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, emp_id: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none"
                  placeholder="Enter employee ID"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Full Name
                </label>
                <input
                  value={formState.full_name}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, full_name: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none"
                  placeholder="Enter name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Department
                </label>
                <input
                  value={formState.department}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, department: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none"
                  placeholder="Enter department"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Join Date
                </label>
                <input
                  value={formState.join_date}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, join_date: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none"
                  type="date"
                  placeholder="Select join date"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <Link
                  href="/employees"
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="rounded-2xl bg-[color:var(--app-primary)] px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_30px_rgba(31,75,153,0.28)]"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Add Employee"}
                </button>
              </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
