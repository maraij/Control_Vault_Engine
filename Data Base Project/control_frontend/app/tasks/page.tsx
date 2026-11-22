"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";

const apiBase =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

type ApiTask = {
  task_id?: number | string;
  title?: string;
  description?: string;
  assignee_id?: number | string;
  status?: string;
  priority?: string;
  due_date?: string;
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

export default function TasksPage() {
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createProjectId, setCreateProjectId] = useState("");
  const [createClientId, setCreateClientId] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createPriority, setCreatePriority] = useState("");
  const [createDueDate, setCreateDueDate] = useState("");
  const [createStatus, setCreateStatus] = useState("Open");
  const [assignTaskId, setAssignTaskId] = useState("");
  const [assignEmpId, setAssignEmpId] = useState("");
  const [doneTaskId, setDoneTaskId] = useState("");
  const [doneEmpId, setDoneEmpId] = useState("");

  const loadTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBase}/tasks`);
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok) {
        setError(data?.error || "Unable to load tasks.");
        return;
      }
      setTasks(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

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
    if (!createTitle.trim()) {
      setActionError("Task title is required.");
      return;
    }
    if (!createProjectId.trim()) {
      setActionError("Project ID is required.");
      return;
    }
    if (!createClientId.trim()) {
      setActionError("Client ID is required.");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        title: createTitle.trim(),
        project_id: createProjectId.trim(),
        client_id: createClientId.trim(),
      };
      const description = createDescription.trim();
      if (description) payload.description = description;
      const priority = createPriority.trim();
      if (priority) payload.priority = priority;
      const dueDate = createDueDate.trim();
      if (dueDate) payload.due_date = dueDate;
      const status = createStatus.trim();
      if (status) payload.status = status;
      await postJson(`${apiBase}/tasks`, payload);
      await loadTasks();
      setCreateTitle("");
      setCreateProjectId("");
      setCreateClientId("");
      setCreateDescription("");
      setCreatePriority("");
      setCreateDueDate("");
      setCreateStatus("Open");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssign = async () => {
    setActionError(null);
    if (!assignTaskId.trim() || !assignEmpId.trim()) {
      setActionError("Task ID and employee ID are required.");
      return;
    }
    setIsSubmitting(true);
    try {
      await postJson(`${apiBase}/tasks/assign`, {
        task_id: assignTaskId.trim(),
        emp_id: assignEmpId.trim(),
      });
      setAssignTaskId("");
      setAssignEmpId("");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDone = async () => {
    setActionError(null);
    if (!doneTaskId.trim() || !doneEmpId.trim()) {
      setActionError("Task ID and employee ID are required.");
      return;
    }
    setIsSubmitting(true);
    try {
      await postJson(`${apiBase}/tasks/done`, {
        task_id: doneTaskId.trim(),
        emp_id: doneEmpId.trim(),
      });
      await loadTasks();
      setDoneTaskId("");
      setDoneEmpId("");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const taskRows = useMemo(() => {
    return tasks.map((task) => {
      const status = task.status || "Open";
      return {
        id: task.task_id ?? "—",
        title: task.title || "Untitled",
        assignee: task.assignee_id ?? "—",
        priority: task.priority || "—",
        status,
        due: formatDate(task.due_date),
        created: formatDate(task.created_at),
      };
    });
  }, [tasks]);

  return (
    <div className="login-shell min-h-screen">
      <div className="dot-grid min-h-screen px-3 py-4 md:px-6 md:py-6 lg:px-0 lg:py-0">
        <div className="mx-auto grid w-full max-w-none gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-stretch lg:gap-0">
          <div className="lg:sticky lg:top-0 lg:h-screen lg:py-0">
            <Sidebar active="tasks" />
          </div>

          <main className="min-h-screen rounded-[28px] bg-white/95 p-6 shadow-[0_30px_60px_rgba(15,23,42,0.12)] backdrop-blur lg:my-0 lg:mr-4">
            <header className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-700 p-6 text-white shadow-sm">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute -left-16 top-10 h-44 w-44 rounded-full bg-emerald-400 blur-3xl" />
                <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-teal-400 blur-3xl" />
              </div>
              <div className="relative flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                    Task Operations
                  </p>
                  <h1 className="font-display text-3xl text-white">Tasks</h1>
                </div>
                <button
                  className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-white/20"
                  onClick={loadTasks}
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
                    Task Records
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Live overview of active, assigned, and completed tasks.
                  </p>
                </div>
              </div>

              <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
                <div className="min-w-[860px]">
                  <div className="grid grid-cols-[110px_minmax(0,1.6fr)_120px_120px_120px_120px_120px] bg-slate-50 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    <span>ID</span>
                    <span>Task</span>
                    <span>Assignee</span>
                    <span>Priority</span>
                    <span>Status</span>
                    <span>Due</span>
                    <span>Created</span>
                  </div>

                  {isLoading ? (
                    <div className="px-6 py-6 text-sm text-slate-500">Loading...</div>
                  ) : (
                    taskRows.map((task) => {
                      const statusKey = String(task.status || "").toLowerCase();
                      const statusTone =
                        statusKey === "open"
                          ? "bg-emerald-100 text-emerald-700"
                          : statusKey === "done"
                          ? "bg-blue-100 text-blue-700"
                          : statusKey === "hold"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-600";

                      return (
                        <div
                          key={`${task.id}-${task.title}`}
                          className="grid grid-cols-[110px_minmax(0,1.6fr)_120px_120px_120px_120px_120px] items-center border-t border-slate-200 px-6 py-4 text-sm text-slate-600"
                        >
                          <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                            {task.id}
                          </span>
                          <span className="font-semibold text-slate-800">{task.title}</span>
                          <span>{task.assignee}</span>
                          <span>{task.priority}</span>
                          <span
                            className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusTone}`}
                          >
                            {task.status}
                          </span>
                          <span>{task.due}</span>
                          <span>{task.created}</span>
                        </div>
                      );
                    })
                  )}

                  {!isLoading && taskRows.length === 0 ? (
                    <div className="px-6 py-6 text-sm text-slate-500">
                      No task records found.
                    </div>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="mt-6 grid gap-4 lg:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Add Task
                </p>
                <div className="mt-3 grid gap-3">
                  <input
                    value={createTitle}
                    onChange={(event) => setCreateTitle(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none"
                    placeholder="Task title"
                  />
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      value={createProjectId}
                      onChange={(event) => setCreateProjectId(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none"
                      placeholder="Project ID"
                    />
                    <input
                      value={createClientId}
                      onChange={(event) => setCreateClientId(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none"
                      placeholder="Client ID"
                    />
                  </div>
                  <textarea
                    value={createDescription}
                    onChange={(event) => setCreateDescription(event.target.value)}
                    className="min-h-[90px] w-full rounded-2xl border border-slate-200 p-3 text-xs text-slate-600 outline-none"
                    placeholder="Task description"
                  />
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      value={createPriority}
                      onChange={(event) => setCreatePriority(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none"
                      placeholder="Priority"
                    />
                    <input
                      type="date"
                      value={createDueDate}
                      onChange={(event) => setCreateDueDate(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none"
                    />
                    <input
                      value={createStatus}
                      onChange={(event) => setCreateStatus(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none"
                      placeholder="Status"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  className="mt-3 w-full rounded-2xl bg-[color:var(--app-primary)] px-4 py-2 text-sm font-semibold text-white"
                  onClick={handleCreate}
                  disabled={isSubmitting}
                >
                  Add Task
                </button>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Assign Task
                </p>
                <div className="mt-3 grid gap-3">
                  <input
                    value={assignTaskId}
                    onChange={(event) => setAssignTaskId(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none"
                    placeholder="Task ID"
                  />
                  <input
                    value={assignEmpId}
                    onChange={(event) => setAssignEmpId(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none"
                    placeholder="Employee ID"
                  />
                </div>
                <button
                  type="button"
                  className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                  onClick={handleAssign}
                  disabled={isSubmitting}
                >
                  Assign Task
                </button>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Complete Task
                </p>
                <div className="mt-3 grid gap-3">
                  <input
                    value={doneTaskId}
                    onChange={(event) => setDoneTaskId(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none"
                    placeholder="Task ID"
                  />
                  <input
                    value={doneEmpId}
                    onChange={(event) => setDoneEmpId(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none"
                    placeholder="Employee ID"
                  />
                </div>
                <button
                  type="button"
                  className="mt-3 w-full rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                  onClick={handleDone}
                  disabled={isSubmitting}
                >
                  Mark Done
                </button>
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
