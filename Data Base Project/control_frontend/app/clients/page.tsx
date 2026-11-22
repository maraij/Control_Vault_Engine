"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";

const apiBase =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

type ApiClient = {
  client_id?: number | string;
  client_name?: string;
  name?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  company_address?: string;
  city?: string;
  country?: string;
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

export default function ClientsPage() {
  const [clients, setClients] = useState<ApiClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createContact, setCreateContact] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPhone, setCreatePhone] = useState("");
  const [createAddress, setCreateAddress] = useState("");
  const [createCity, setCreateCity] = useState("");
  const [createCountry, setCreateCountry] = useState("");
  const [updateId, setUpdateId] = useState("");
  const [updatePayload, setUpdatePayload] = useState(
    '{"client_name":"Acme Global"}'
  );
  const [deleteId, setDeleteId] = useState("");

  const loadClients = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBase}/clients`);
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok) {
        setError(data?.error || "Unable to load clients.");
        return;
      }
      setClients(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const parsePayload = (value: string) => {
    if (!value.trim()) {
      return null;
    }
    return JSON.parse(value);
  };

  const buildCreatePayload = () => {
    const payload: Record<string, unknown> = {};
    const name = createName.trim();
    if (name) {
      payload.client_name = name;
    }
    const contact = createContact.trim();
    if (contact) payload.contact_person = contact;
    const email = createEmail.trim();
    if (email) payload.email = email;
    const phone = createPhone.trim();
    if (phone) payload.phone = phone;
    const address = createAddress.trim();
    if (address) payload.company_address = address;
    const city = createCity.trim();
    if (city) payload.city = city;
    const country = createCountry.trim();
    if (country) payload.country = country;
    return payload;
  };

  const handleCreate = async () => {
    setActionError(null);
    if (!createName.trim()) {
      setActionError("Client name is required.");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = buildCreatePayload();
      const response = await fetch(`${apiBase}/clients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok) {
        setActionError(data?.error || "Unable to create client.");
        return;
      }
      await loadClients();
      setCreateName("");
      setCreateContact("");
      setCreateEmail("");
      setCreatePhone("");
      setCreateAddress("");
      setCreateCity("");
      setCreateCountry("");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!updateId.trim()) {
      setActionError("Client ID is required for update.");
      return;
    }
    setActionError(null);
    setIsSubmitting(true);
    try {
      const payload = parsePayload(updatePayload) ?? {};
      const response = await fetch(`${apiBase}/clients/${updateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok) {
        setActionError(data?.error || "Unable to update client.");
        return;
      }
      await loadClients();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId.trim()) {
      setActionError("Client ID is required for delete.");
      return;
    }
    setActionError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiBase}/clients/${deleteId}`, {
        method: "DELETE",
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok) {
        setActionError(data?.error || "Unable to delete client.");
        return;
      }
      await loadClients();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const clientRows = useMemo(() => {
    return clients.map((client) => {
      return {
        id: client.client_id ?? "—",
        name: client.client_name || client.name || "Unknown",
        contact: client.contact_person || "—",
        email: client.email || "—",
        phone: client.phone || "—",
        city: client.city || "—",
        country: client.country || "—",
        created: formatDate(client.created_at),
      };
    });
  }, [clients]);

  return (
    <div className="login-shell min-h-screen">
      <div className="dot-grid min-h-screen px-3 py-4 md:px-6 md:py-6 lg:px-0 lg:py-0">
        <div className="mx-auto grid w-full max-w-none gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-stretch lg:gap-0">
          <div className="lg:sticky lg:top-0 lg:h-screen lg:py-0">
            <Sidebar active="clients" />
          </div>

          <main className="min-h-screen rounded-[28px] bg-white/95 p-6 shadow-[0_30px_60px_rgba(15,23,42,0.12)] backdrop-blur lg:my-0 lg:mr-4">
            <header className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-800 p-6 text-white shadow-sm">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute -left-16 top-10 h-44 w-44 rounded-full bg-indigo-400 blur-3xl" />
                <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-400 blur-3xl" />
              </div>
              <div className="relative flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200">
                    Client Management
                  </p>
                  <h1 className="font-display text-3xl text-white">Clients</h1>
                </div>
                <button
                  className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-white/20"
                  onClick={loadClients}
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
                    Client Records
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Complete directory of onboarded client accounts.
                  </p>
                </div>
              </div>

              <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
                <div className="min-w-[920px]">
                  <div className="grid grid-cols-[110px_minmax(0,1.6fr)_160px_200px_140px_120px_120px_120px] bg-slate-50 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    <span>ID</span>
                    <span>Client</span>
                    <span>Contact</span>
                    <span>Email</span>
                    <span>Phone</span>
                    <span>City</span>
                    <span>Country</span>
                    <span>Created</span>
                  </div>

                  {isLoading ? (
                    <div className="px-6 py-6 text-sm text-slate-500">Loading...</div>
                  ) : (
                    clientRows.map((client) => (
                      <div
                        key={`${client.id}-${client.email}`}
                        className="grid grid-cols-[110px_minmax(0,1.6fr)_160px_200px_140px_120px_120px_120px] items-center border-t border-slate-200 px-6 py-4 text-sm text-slate-600"
                      >
                        <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                          {client.id}
                        </span>
                        <span className="font-semibold text-slate-800">{client.name}</span>
                        <span>{client.contact}</span>
                        <span className="truncate">{client.email}</span>
                        <span>{client.phone}</span>
                        <span>{client.city}</span>
                        <span>{client.country}</span>
                        <span>{client.created}</span>
                      </div>
                    ))
                  )}

                  {!isLoading && clientRows.length === 0 ? (
                    <div className="px-6 py-6 text-sm text-slate-500">
                      No client records found.
                    </div>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="mt-6 grid gap-4 lg:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Add Client
                </p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <input
                    value={createName}
                    onChange={(event) => setCreateName(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none"
                    placeholder="Client name"
                  />
                  <input
                    value={createContact}
                    onChange={(event) => setCreateContact(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none"
                    placeholder="Contact person"
                  />
                  <input
                    value={createEmail}
                    onChange={(event) => setCreateEmail(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none"
                    placeholder="Email"
                  />
                  <input
                    value={createPhone}
                    onChange={(event) => setCreatePhone(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none"
                    placeholder="Phone"
                  />
                  <input
                    value={createCity}
                    onChange={(event) => setCreateCity(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none"
                    placeholder="City"
                  />
                  <input
                    value={createCountry}
                    onChange={(event) => setCreateCountry(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none"
                    placeholder="Country"
                  />
                </div>
                <textarea
                  value={createAddress}
                  onChange={(event) => setCreateAddress(event.target.value)}
                  className="mt-3 min-h-[90px] w-full rounded-2xl border border-slate-200 p-3 text-xs text-slate-600 outline-none"
                  placeholder="Company address"
                />
                <button
                  type="button"
                  className="mt-3 w-full rounded-2xl bg-[color:var(--app-primary)] px-4 py-2 text-sm font-semibold text-white"
                  onClick={handleCreate}
                  disabled={isSubmitting}
                >
                  Add Client
                </button>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Update Client
                </p>
                <input
                  value={updateId}
                  onChange={(event) => setUpdateId(event.target.value)}
                  className="mt-3 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none"
                  placeholder="Client ID"
                />
                <textarea
                  value={updatePayload}
                  onChange={(event) => setUpdatePayload(event.target.value)}
                  className="mt-3 min-h-[120px] w-full rounded-2xl border border-slate-200 p-3 text-xs text-slate-600 outline-none"
                />
                <button
                  type="button"
                  className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                  onClick={handleUpdate}
                  disabled={isSubmitting}
                >
                  Update Client
                </button>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Delete Client
                </p>
                <input
                  value={deleteId}
                  onChange={(event) => setDeleteId(event.target.value)}
                  className="mt-3 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none"
                  placeholder="Client ID"
                />
                <button
                  type="button"
                  className="mt-3 w-full rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                >
                  Delete Client
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
