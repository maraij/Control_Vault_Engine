"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

type ApiEmployee = {
  emp_id?: string;
  full_name?: string;
  department?: string;
  join_date?: string;
  last_active?: string;
  status?: string;
  email?: string;
};

type AuditSummary = {
  employees_added?: number;
  employees_deleted?: number;
  employees_archived?: number;
  total_actions?: number;
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<ApiEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuditLoading, setIsAuditLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [auditSummary, setAuditSummary] = useState<AuditSummary | null>(null);

  // UI states
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ApiEmployee | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<ApiEmployee | null>(null);
  const [archiveReason, setArchiveReason] = useState("");
  const [isArchiving, setIsArchiving] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const response = await fetch(`${apiBase}/employees`);
        const data = await response.json().catch(() => null);

        if (!response.ok || !data?.ok) {
          setError(data?.error || "Unable to load employees.");
          return;
        }

        setEmployees(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unable to reach the server.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    const loadAuditSummary = async () => {
      try {
        const response = await fetch(`${apiBase}/reports/audit-today-summary`);
        const data = await response.json().catch(() => null);
        if (!response.ok || !data?.ok) {
          return;
        }
        setAuditSummary(data.data ?? data);
      } catch {
        // Keep audit cards in fallback state when summary is unavailable.
      } finally {
        setIsAuditLoading(false);
      }
    };

    loadEmployees();
    loadAuditSummary();
  }, []);

  const employeeRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = employees
      .filter((employee) => {
        const status = String(employee.status || "").toLowerCase();
        return status !== "deleted";
      })
      .filter((employee) => {
        if (!q) return true;
        const id = String(employee.emp_id || "").toLowerCase();
        const name = String(employee.full_name || "").toLowerCase();
        return id.includes(q) || name.includes(q);
      });

    return filtered.map((employee) => {
      const dept = employee.department || "General";
      const deptKey = dept.toLowerCase();
      const deptTone =
        deptKey === "engineering"
          ? "bg-blue-100 text-blue-700"
          : deptKey === "security"
          ? "bg-amber-100 text-amber-700"
          : deptKey === "operations"
          ? "bg-emerald-100 text-emerald-700"
          : deptKey === "it"
          ? "bg-indigo-100 text-indigo-700"
          : deptKey === "hr"
          ? "bg-rose-100 text-rose-700"
          : "bg-slate-100 text-slate-600";

      const status = employee.status || "Active";
      const statusKey = status.toLowerCase();
      const statusTone =
        statusKey === "active"
          ? "text-emerald-600"
          : statusKey === "archived"
          ? "text-amber-600"
          : "text-slate-400";

      return {
        id: employee.emp_id || "CV-XXXX",
        name: employee.full_name || "Unknown",
        email: employee.email || "unknown@controlvault.com",
        dept,
        deptTone,
        joined: employee.join_date || "—",
        active: employee.last_active || "—",
        status,
        statusTone,
      };
    });
  }, [employees, searchQuery]);

  const activeEmployeesCount = useMemo(() => {
    return employees.filter((employee) => {
      const status = String(employee.status || "").toLowerCase();
      return status !== "deleted" && status !== "archived";
    }).length;
  }, [employees]);

  const totalEmployees = employees.length;
  const systemLoadPercent =
    totalEmployees > 0
      ? Math.round((activeEmployeesCount / totalEmployees) * 100)
      : 0;

  const handleOpenDelete = (employee: ApiEmployee) => {
    setDeleteError(null);
    setDeleteTarget(employee);
  };

  const handleCloseDelete = () => {
    setDeleteTarget(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.emp_id) {
      setDeleteError("Missing employee ID.");
      return;
    }
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const response = await fetch(`${apiBase}/employees/${deleteTarget.emp_id}`, {
        method: "DELETE",
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok) {
        setDeleteError(data?.error || "Unable to delete employee.");
        return;
      }
      setEmployees((prev) => prev.filter((row) => row.emp_id !== deleteTarget.emp_id));
      handleCloseDelete();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenArchive = (employee: ApiEmployee) => {
    setArchiveError(null);
    setArchiveReason("");
    setArchiveTarget(employee);
  };

  const handleCloseArchive = () => {
    setArchiveTarget(null);
    setArchiveError(null);
    setArchiveReason("");
  };

  const handleConfirmArchive = async () => {
    if (!archiveTarget?.emp_id) {
      setArchiveError("Missing employee ID.");
      return;
    }
    if (!archiveReason.trim()) {
      setArchiveError("Please enter a reason for archive.");
      return;
    }
    setIsArchiving(true);
    setArchiveError(null);
    try {
      const response = await fetch(
        `${apiBase}/employees/${archiveTarget.emp_id}/backup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: archiveReason.trim() }),
        }
      );
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok) {
        setArchiveError(data?.error || "Unable to archive employee.");
        return;
      }
      handleCloseArchive();
    } catch (err) {
      setArchiveError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <div className="login-shell min-h-screen">
      <div className="dot-grid min-h-screen px-3 py-4 md:px-6 md:py-6 lg:px-0 lg:py-0">
        <div className="mx-auto grid w-full max-w-none gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-stretch lg:gap-0">
          <div className="lg:sticky lg:top-0 lg:h-screen lg:py-0">
            <Sidebar active="employees" />
          </div>

          <main className="min-h-screen rounded-[28px] bg-white/95 p-6 shadow-[0_30px_60px_rgba(15,23,42,0.12)] backdrop-blur lg:my-6 lg:mr-6">
            <header className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-800 p-6 text-white shadow-sm">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute -left-20 top-10 h-48 w-48 rounded-full bg-emerald-400 blur-3xl" />
                <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-400 blur-3xl" />
              </div>
              <div className="relative flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                    Control Vault Employee Management
                  </p>
                  <h1 className="font-display text-3xl text-white">
                    Employee Command Center
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <input
                      type="search"
                      placeholder="Global search..."
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

                  <button className="rounded-full border border-white/20 bg-white/90 px-3 py-2 text-slate-600 shadow-sm">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    >
                      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
                      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
                    </svg>
                  </button>

                  <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/90 px-3 py-2 shadow-sm">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-[color:var(--app-primary-soft)] text-xs font-semibold text-[color:var(--app-primary)]">
                      AU
                    </span>
                    <div className="text-right text-xs">
                      <p className="font-semibold text-slate-800">Admin Unit_01</p>
                      <p className="text-slate-500">Super Administrator</p>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            <section className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-700">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">System Auto-Retention Active</p>
                  <p className="text-xs text-amber-600">
                    2 days inactivity = auto-archive for non-executive accounts.
                  </p>
                </div>
                <button className="rounded-full border border-amber-200 bg-white px-3 py-1.5 text-xs font-semibold text-amber-700">
                  View Policy
                </button>
              </div>
            </section>

            {error ? (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
                {error}
              </div>
            ) : null}

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              {[
                {
                  label: "Active Now",
                  value: isLoading ? "..." : String(activeEmployeesCount),
                  note: totalEmployees ? `${totalEmployees} total` : "No data",
                  tone: "text-emerald-600",
                },
                {
                  label: "Archived Today",
                  value: isAuditLoading
                    ? "..."
                    : String(auditSummary?.employees_archived ?? 0),
                  note: "Audit logs",
                  tone: "text-amber-600",
                },
                {
                  label: "Pending Sync",
                  value: isAuditLoading
                    ? "..."
                    : String(auditSummary?.total_actions ?? 0),
                  note: "Audit actions",
                  tone: "text-blue-600",
                },
                {
                  label: "System Load",
                  value: isLoading ? "..." : `${systemLoadPercent}%`,
                  note: totalEmployees ? "Active vs total" : "No data",
                  tone: "text-emerald-600",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    {item.label}
                  </p>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-2xl font-semibold text-slate-900">{item.value}</span>
                    <span className={`text-xs font-semibold ${item.tone}`}>{item.note}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Employees</h2>
                <p className="text-sm text-slate-500">
                  Directory of all personnel with system access credentials.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/employees/archive"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300"
                >
                  Archive & Restore
                </Link>
                <Link
                  href="/employees/add"
                  className="flex items-center gap-2 rounded-2xl bg-[color:var(--app-primary)] px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_30px_rgba(31,75,153,0.28)] transition hover:translate-y-[-1px]"
                >
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-white/20">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 5v14" />
                      <path d="M5 12h14" />
                    </svg>
                  </span>
                  Add New Employee
                </Link>
              </div>
            </div>

            {/* ✅ Updated Filters Row (proper spacing + alignment) */}
            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {/* Search */}
              <label className="flex h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm focus-within:border-[color:var(--app-primary)] focus-within:ring-2 focus-within:ring-[color:var(--app-primary-soft)]">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  placeholder="Search by ID or name..."
                />
              </label>

              {/* Department */}
              <button
                type="button"
                className="group flex h-12 items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 text-sm shadow-sm transition hover:border-slate-300"
              >
                <span className="text-slate-600">Department</span>
                <span className="flex items-center gap-2">
                  <span className="font-semibold text-[color:var(--app-primary)]">
                    All Depts
                  </span>
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 text-slate-400 transition group-hover:text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              </button>

              {/* Status */}
              <button
                type="button"
                className="group flex h-12 items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 text-sm shadow-sm transition hover:border-slate-300"
              >
                <span className="text-slate-600">Status</span>
                <span className="flex items-center gap-2">
                  <span className="font-semibold text-[color:var(--app-primary)]">
                    All Status
                  </span>
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 text-slate-400 transition group-hover:text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              </button>

              {/* Role */}
              <button
                type="button"
                className="group flex h-12 items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 text-sm shadow-sm transition hover:border-slate-300"
              >
                <span className="text-slate-600">Role</span>
                <span className="flex items-center gap-2">
                  <span className="font-semibold text-[color:var(--app-primary)]">
                    All Roles
                  </span>
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 text-slate-400 transition group-hover:text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              </button>
            </div>

            <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
              <div className="grid grid-cols-[110px_minmax(0,1.4fr)_160px_140px_130px_120px_60px] bg-slate-50 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                <span>Emp ID</span>
                <span>Employee Name</span>
                <span>Department</span>
                <span>Join Date</span>
                <span>Last Active</span>
                <span>Status</span>
                <span>Act</span>
              </div>

              {employeeRows.map((employee) => {
                const sourceEmployee =
                  employees.find((row) => row.emp_id === employee.id) || {
                    emp_id: employee.id,
                    full_name: employee.name,
                    department: employee.dept,
                    join_date: employee.joined,
                  };

                return (
                  <div
                    key={employee.id}
                    className="grid grid-cols-[110px_minmax(0,1.4fr)_160px_140px_130px_120px_60px] items-center border-t border-slate-200 px-6 py-4 text-sm"
                  >
                    <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                      {employee.id}
                    </span>

                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                        {employee.name
                          .split(" ")
                          .map((word) => word[0])
                          .join("")}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-800">{employee.name}</p>
                        <p className="text-xs text-slate-400">{employee.email}</p>
                      </div>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${employee.deptTone}`}
                    >
                      {employee.dept}
                    </span>

                    <span className="text-slate-500">{employee.joined}</span>
                    <span className="text-slate-400">{employee.active}</span>

                    <span className={`flex items-center gap-2 ${employee.statusTone}`}>
                      <span className="h-2 w-2 rounded-full bg-current" />
                      {employee.status}
                    </span>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/employees/${sourceEmployee.emp_id || employee.id}/edit`}
                        className={`grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-400 transition hover:border-slate-300 hover:text-slate-600 ${
                          isLoading ? "pointer-events-none opacity-60" : ""
                        }`}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path d="M4 20h4l10-10-4-4L4 16v4Z" />
                          <path d="m14 6 4 4" />
                        </svg>
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleOpenArchive(sourceEmployee)}
                        className={`grid h-9 w-9 place-items-center rounded-full border border-amber-200 text-amber-500 transition hover:border-amber-300 hover:text-amber-600 ${
                          isLoading ? "pointer-events-none opacity-60" : ""
                        }`}
                        disabled={isLoading}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path d="M3 7h18" />
                          <path d="M5 7 6.5 4h11L19 7" />
                          <path d="M7 7v12h10V7" />
                          <path d="M9.5 11h5" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenDelete(sourceEmployee)}
                        className={`grid h-9 w-9 place-items-center rounded-full border border-rose-200 text-rose-400 transition hover:border-rose-300 hover:text-rose-600 ${
                          isLoading ? "pointer-events-none opacity-60" : ""
                        }`}
                        disabled={isLoading}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path d="M5 7h14" />
                          <path d="M9 7V5h6v2" />
                          <path d="M8 7v12" />
                          <path d="M16 7v12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}

              {!isLoading && employeeRows.length === 0 ? (
                <div className="px-6 py-6 text-sm text-slate-500">
                  No employee records found.
                </div>
              ) : null}
            </div>

          </main>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteTarget ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/60 px-4 py-8">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-[0_30px_80px_rgba(15,23,42,0.35)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Delete Employee
                </p>
                <h3 className="text-xl font-semibold text-slate-900">Confirm deletion</h3>
              </div>
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-400 hover:text-slate-600"
                onClick={handleCloseDelete}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6 18 18" />
                  <path d="M6 18 18 6" />
                </svg>
              </button>
            </div>

            <p className="mt-5 text-sm text-slate-600">
              You are about to delete employee{" "}
              <span className="font-semibold text-slate-900">{deleteTarget.emp_id}</span>. This action cannot be undone.
            </p>

            {deleteError ? (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
                {deleteError}
              </div>
            ) : null}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                onClick={handleCloseDelete}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_30px_rgba(225,29,72,0.25)]"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Archive Modal */}
      {archiveTarget ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/60 px-4 py-8">
          <div className="w-full max-w-sm rounded-3xl bg-white px-8 py-7 text-center shadow-[0_30px_80px_rgba(15,23,42,0.35)]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 7h18" />
                <path d="M5 7 6.5 4h11L19 7" />
                <path d="M7 7v12h10V7" />
                <path d="M12 10v5" />
              </svg>
            </div>

            <h3 className="mt-4 text-xl font-semibold text-slate-900">Archive Employee?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to archive{" "}
              <span className="font-semibold text-slate-900">{archiveTarget.emp_id}</span>? Archived records can be restored later.
            </p>

            <div className="mt-5">
              <input
                value={archiveReason}
                onChange={(event) => setArchiveReason(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none"
                placeholder="Reason for archive"
              />
            </div>

            {archiveError ? (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-700">
                {archiveError}
              </div>
            ) : null}

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                onClick={handleCloseArchive}
                disabled={isArchiving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-2xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_30px_rgba(245,158,11,0.25)]"
                onClick={handleConfirmArchive}
                disabled={isArchiving}
              >
                {isArchiving ? "Archiving..." : "Archive Record"}
              </button>
            </div>

            <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-300">
              Secure audit protocol active
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
