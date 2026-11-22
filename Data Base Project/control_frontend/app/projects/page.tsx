"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";

const apiBase =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

type ApiProject = {
  project_id?: number | string;
  project_name?: string;
  name?: string;
  client_id?: number | string;
  start_date?: string;
  end_date?: string;
  status?: string;
  budget?: number | string;
  created_at?: string;
};

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString("en-CA");
};

const formatBudget = (value?: number | string) => {
  if (value === null || value === undefined || value === "") return "—";
  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    return numeric.toLocaleString("en-US");
  }
  return String(value);
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createClientId, setCreateClientId] = useState("");
  const [createStartDate, setCreateStartDate] = useState("");
  const [createEndDate, setCreateEndDate] = useState("");
  const [createStatus, setCreateStatus] = useState("ONGOING");
  const [createBudget, setCreateBudget] = useState("");
  const [updateId, setUpdateId] = useState("");
  const [updateStatus, setUpdateStatus] = useState("");
  const [updateStartDate, setUpdateStartDate] = useState("");
  const [updateEndDate, setUpdateEndDate] = useState("");
  const [updateBudget, setUpdateBudget] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const [assignProjectId, setAssignProjectId] = useState("");
  const [assignEmpId, setAssignEmpId] = useState("");
  const [completeProjectId, setCompleteProjectId] = useState("");
  const [completeEmpId, setCompleteEmpId] = useState("");

  const loadProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBase}/projects`);
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok) {
        setError(data?.error || "Unable to load projects.");
        return;
      }
      setProjects(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const buildCreatePayload = () => {
    const payload: Record<string, unknown> = {};
    const name = createName.trim();
    if (name) {
      payload.project_name = name;
    }
    const clientId = createClientId.trim();
    if (clientId) {
      const numeric = Number(clientId);
      payload.client_id = Number.isNaN(numeric) ? clientId : numeric;
    }
    const start = createStartDate.trim();
    if (start) payload.start_date = start;
    const end = createEndDate.trim();
    if (end) payload.end_date = end;
    const status = createStatus.trim();
    if (status) payload.status = status.toUpperCase();
    const budget = createBudget.trim();
    if (budget) payload.budget = budget;
    return payload;
  };

  const postJson = async (url: string, payload: object) => {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.ok) {
      throw new Error(data?.error || "Request failed.");
    }
  };

  const handleCreate = async () => {
    setActionError(null);
    if (!createName.trim()) {
      setActionError("Project name is required.");
      return;
    }
    if (!createClientId.trim()) {
      setActionError("Client ID is required.");
      return;
    }
    setIsSubmitting(true);
    try {
      await postJson(`${apiBase}/projects`, buildCreatePayload());
      await loadProjects();
      setCreateName("");
      setCreateClientId("");
      setCreateStartDate("");
      setCreateEndDate("");
      setCreateStatus("ONGOING");
      setCreateBudget("");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const projectRows = useMemo(() => {
    return projects.map((project) => {
      const name = project.project_name || project.name || "Untitled";
      const status = project.status || "Active";
      return {
        id: project.project_id ?? "—",
        name,
        client: project.client_id ?? "—",
        start: formatDate(project.start_date),
        end: formatDate(project.end_date),
        status,
        budget: formatBudget(project.budget),
      };
    });
  }, [projects]);

  const handleUpdate = async () => {
    if (!updateId.trim()) {
      setActionError("Project ID is required for update.");
      return;
    }
    const payload: Record<string, unknown> = {};
    if (updateStatus.trim()) {
      payload.status = updateStatus.trim().toUpperCase();
    }
    if (updateStartDate.trim()) {
      payload.start_date = updateStartDate.trim();
    }
    if (updateEndDate.trim()) {
      payload.end_date = updateEndDate.trim();
    }
    if (updateBudget.trim()) {
      const numeric = Number(updateBudget.trim());
      payload.budget = Number.isNaN(numeric) ? updateBudget.trim() : numeric;
    }
    if (Object.keys(payload).length === 0) {
      setActionError("Add at least one field to update.");
      return;
    }
    setActionError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiBase}/projects/${updateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "Unable to update project.");
      }
      await loadProjects();
      setUpdateStatus("");
      setUpdateStartDate("");
      setUpdateEndDate("");
      setUpdateBudget("");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId.trim()) {
      setActionError("Project ID is required for delete.");
      return;
    }
    setActionError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiBase}/projects/${deleteId}`, {
        method: "DELETE",
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "Unable to delete project.");
      }
      await loadProjects();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssign = async () => {
    setActionError(null);
    if (!assignProjectId.trim() || !assignEmpId.trim()) {
      setActionError("Project ID and employee ID are required.");
      return;
    }
    setIsSubmitting(true);
    try {
      await postJson(`${apiBase}/projects/assign`, {
        project_id: assignProjectId.trim(),
        emp_id: assignEmpId.trim(),
      });
      setAssignProjectId("");
      setAssignEmpId("");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async () => {
    setActionError(null);
    if (!completeProjectId.trim() || !completeEmpId.trim()) {
      setActionError("Project ID and employee ID are required.");
      return;
    }
    setIsSubmitting(true);
    try {
      await postJson(`${apiBase}/projects/complete`, {
        project_id: completeProjectId.trim(),
        emp_id: completeEmpId.trim(),
      });
      await loadProjects();
      setCompleteProjectId("");
      setCompleteEmpId("");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-shell min-h-screen">
      <div className="dot-grid min-h-screen px-3 py-4 md:px-6 md:py-6 lg:px-0 lg:py-0">
        <div className="mx-auto grid w-full max-w-none gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-stretch lg:gap-0">
          <div className="lg:sticky lg:top-0 lg:h-screen lg:py-0">
            <Sidebar active="projects" />
          </div>

          <main className="min-h-screen rounded-[28px] bg-white/95 p-6 shadow-[0_30px_60px_rgba(15,23,42,0.12)] backdrop-blur lg:my-0 lg:mr-4">
            <header className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-sky-800 p-6 text-white shadow-sm">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute -left-16 top-10 h-44 w-44 rounded-full bg-sky-400 blur-3xl" />
                <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-400 blur-3xl" />
              </div>
              <div className="relative flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
                    Project Operations
                  </p>
                  <h1 className="font-display text-3xl text-white">Projects</h1>
                </div>
                <button
                  className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-white/20"
                  onClick={loadProjects}
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

            <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Project Records
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Complete list of active, archived, and completed projects.
                  </p>
                </div>
              </div>

              <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
                <div className="min-w-[760px]">
                  <div className="grid grid-cols-[110px_minmax(0,1.6fr)_120px_120px_120px_120px_120px] bg-slate-50 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    <span>ID</span>
                    <span>Project Name</span>
                    <span>Client</span>
                    <span>Start</span>
                    <span>End</span>
                    <span>Status</span>
                    <span>Budget</span>
                  </div>

                  {isLoading ? (
                    <div className="px-6 py-6 text-sm text-slate-500">Loading...</div>
                  ) : (
                    projectRows.map((project) => {
                      const statusKey = String(project.status || "").toLowerCase();
                      const statusTone =
                        statusKey === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : statusKey === "completed"
                          ? "bg-blue-100 text-blue-700"
                          : statusKey === "hold"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-600";

                      return (
                        <div
                          key={`${project.id}-${project.name}`}
                          className="grid grid-cols-[110px_minmax(0,1.6fr)_120px_120px_120px_120px_120px] items-center border-t border-slate-200 px-6 py-4 text-sm text-slate-600"
                        >
                          <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                            {project.id}
                          </span>
                          <span className="font-semibold text-slate-800">
                            {project.name}
                          </span>
                          <span>{project.client}</span>
                          <span>{project.start}</span>
                          <span>{project.end}</span>
                          <span
                            className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusTone}`}
                          >
                            {project.status}
                          </span>
                          <span className="text-slate-500">{project.budget}</span>
                        </div>
                      );
                    })
                  )}

                  {!isLoading && projectRows.length === 0 ? (
                    <div className="px-6 py-6 text-sm text-slate-500">
                      No project records found.
                    </div>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="mt-6 grid gap-4 lg:grid-cols-3">
              <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Add Project
                </p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <input
                    value={createName}
                    onChange={(event) => setCreateName(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none"
                    placeholder="Project name"
                  />
                  <input
                    value={createClientId}
                    onChange={(event) => setCreateClientId(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none"
                    placeholder="Client ID"
                  />
                  <input
                    type="date"
                    value={createStartDate}
                    onChange={(event) => setCreateStartDate(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none"
                  />
                  <input
                    type="date"
                    value={createEndDate}
                    onChange={(event) => setCreateEndDate(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none"
                  />
                  <select
                    value={createStatus}
                    onChange={(event) => setCreateStatus(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none"
                  >
                    <option value="ONGOING">ONGOING</option>
                    <option value="HOLD">HOLD</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                  <input
                    value={createBudget}
                    onChange={(event) => setCreateBudget(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none"
                    placeholder="Budget"
                  />
                </div>
                <div className="mt-auto pt-4">
                  <button
                    type="button"
                    className="w-full rounded-2xl bg-[color:var(--app-primary)] px-4 py-2 text-sm font-semibold text-white"
                    onClick={handleCreate}
                    disabled={isSubmitting}
                  >
                    Add Project
                  </button>
                </div>
              </div>
              <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Update Project
                </p>
                <input
                  value={updateId}
                  onChange={(event) => setUpdateId(event.target.value)}
                  className="mt-3 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none"
                  placeholder="Project ID"
                />
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <select
                    value={updateStatus}
                    onChange={(event) => setUpdateStatus(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none"
                  >
                    <option value="">Status (optional)</option>
                    <option value="ONGOING">ONGOING</option>
                    <option value="HOLD">HOLD</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                  <input
                    value={updateBudget}
                    onChange={(event) => setUpdateBudget(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none"
                    placeholder="Budget (optional)"
                  />
                  <input
                    type="date"
                    value={updateStartDate}
                    onChange={(event) => setUpdateStartDate(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none"
                  />
                  <input
                    type="date"
                    value={updateEndDate}
                    onChange={(event) => setUpdateEndDate(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none"
                  />
                </div>
                <div className="mt-auto pt-4">
                  <button
                    type="button"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                    onClick={handleUpdate}
                    disabled={isSubmitting}
                  >
                    Update Project
                  </button>
                </div>
              </div>
              <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Delete Project
                </p>
                <input
                  value={deleteId}
                  onChange={(event) => setDeleteId(event.target.value)}
                  className="mt-3 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none"
                  placeholder="Project ID"
                />
                <div className="mt-auto pt-4">
                  <button
                    type="button"
                    className="w-full rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                  >
                    Delete Project
                  </button>
                </div>
              </div>
            </section>

            <section className="mt-6 grid gap-4 lg:grid-cols-2">
              <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Assign Project
                </p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <input
                    value={assignProjectId}
                    onChange={(event) => setAssignProjectId(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none"
                    placeholder="Project ID"
                  />
                  <input
                    value={assignEmpId}
                    onChange={(event) => setAssignEmpId(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none"
                    placeholder="Employee ID"
                  />
                </div>
                <div className="mt-auto pt-4">
                  <button
                    type="button"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                    onClick={handleAssign}
                    disabled={isSubmitting}
                  >
                    Assign
                  </button>
                </div>
              </div>
              <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Complete Project
                </p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <input
                    value={completeProjectId}
                    onChange={(event) => setCompleteProjectId(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none"
                    placeholder="Project ID"
                  />
                  <input
                    value={completeEmpId}
                    onChange={(event) => setCompleteEmpId(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none"
                    placeholder="Employee ID"
                  />
                </div>
                <div className="mt-auto pt-4">
                  <button
                    type="button"
                    className="w-full rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                    onClick={handleComplete}
                    disabled={isSubmitting}
                  >
                    Mark Complete
                  </button>
                </div>
              </div>
            </section>

            {actionError ? (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-700">
                {actionError}
              </div>
            ) : null}
          </main>
        </div>
      </div>
    </div>
  );
}
