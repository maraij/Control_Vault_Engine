"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const apiBase =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

type ApiEmployee = {
  emp_id?: string;
  full_name?: string;
  department?: string;
  join_date?: string;
  email?: string;
};

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams<{ emp_id: string }>();
  const [formState, setFormState] = useState({
    emp_id: "",
    full_name: "",
    department: "",
    join_date: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEmployee = async () => {
      try {
        const response = await fetch(`${apiBase}/employees`);
        const data = await response.json().catch(() => null);
        if (!response.ok || !data?.ok) {
          setError(data?.error || "Unable to load employee.");
          return;
        }
        const rows: ApiEmployee[] = Array.isArray(data.data) ? data.data : [];
        const employee = rows.find((row) => row.emp_id === params.emp_id);
        if (!employee) {
          return;
        }
        setFormState({
          emp_id: employee.emp_id || params.emp_id,
          full_name: employee.full_name || "",
          department: employee.department || "",
          join_date: employee.join_date || "",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Request failed.");
      } finally {
        setIsLoading(false);
      }
    };

    loadEmployee();
  }, [params.emp_id]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`${apiBase}/employees/${params.emp_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: formState.full_name,
          department: formState.department,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok) {
        setError(data?.error || "Unable to update employee.");
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
            <div className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-800 p-6 text-white">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute -left-12 top-6 h-32 w-32 rounded-full bg-blue-400 blur-3xl" />
                <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-cyan-400 blur-3xl" />
              </div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
                    Edit Employee
                  </p>
                  <h1 className="text-2xl font-semibold text-white">
                    Update employee details
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
                  disabled
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-500 outline-none"
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
                  placeholder="e.g. Jordan Vega"
                  disabled={isLoading}
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
                  placeholder="Engineering"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Join Date
                </label>
                <input
                  value={formState.join_date}
                  disabled
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-500 outline-none"
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
                  disabled={isSaving || isLoading}
                >
                  {isSaving ? "Saving..." : "Update Employee"}
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
