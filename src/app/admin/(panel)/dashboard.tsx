"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Logo } from "@/components/Logo";
import { business, serviceOptions } from "@/lib/business";
import { statusLabels, type Inquiry, type InquiryStatus } from "@/lib/types";

const filters: Array<{ id: "all" | InquiryStatus; label: string }> = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "checked", label: "Checked" },
  { id: "enrolled", label: "Enrolled" },
  { id: "closed", label: "Closed" },
];

const emptyEnroll = {
  name: "",
  email: "",
  phone: "",
  company: "",
  service: "Website",
  message: "",
};

function formatWhen(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function mailAppHref(inquiry: Inquiry) {
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: inquiry.email,
    su: `Reply from Code Colleagues about ${inquiry.service}`,
    body: `Hello ${inquiry.name},\n\n`,
    authuser: business.emailBusiness,
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

export function Dashboard() {
  const router = useRouter();
  const [items, setItems] = useState<Inquiry[]>([]);
  const [mailConfigured, setMailConfigured] = useState(false);
  const [mailTo, setMailTo] = useState<string[]>([]);
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [enroll, setEnroll] = useState(emptyEnroll);
  const [busy, setBusy] = useState(false);

  const selected = items.find((item) => item.id === selectedId) ?? null;

  async function load() {
    const [listRes, meRes] = await Promise.all([
      fetch("/api/admin/inquiries", { cache: "no-store" }),
      fetch("/api/admin/me", { cache: "no-store" }),
    ]);
    if (listRes.status === 401 || meRes.status === 401) {
      router.push("/admin/login");
      router.refresh();
      return;
    }
    const list = (await listRes.json()) as { items: Inquiry[] };
    const me = (await meRes.json()) as { mailConfigured: boolean; mailTo: string[] };
    setItems(list.items || []);
    setMailConfigured(Boolean(me.mailConfigured));
    setMailTo(me.mailTo || []);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setNotes(selected?.notes ?? "");
  }, [selected?.id, selected?.notes]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      if (filter !== "all" && item.status !== filter) return false;
      if (!needle) return true;
      return [item.name, item.email, item.phone, item.company, item.service, item.message]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [items, filter, query]);

  const counts = useMemo(() => {
    return {
      all: items.length,
      new: items.filter((item) => item.status === "new").length,
      checked: items.filter((item) => item.status === "checked").length,
      enrolled: items.filter((item) => item.status === "enrolled").length,
      closed: items.filter((item) => item.status === "closed").length,
    };
  }, [items]);

  function replaceItem(next: Inquiry) {
    setItems((current) => current.map((item) => (item.id === next.id ? next : item)));
  }

  async function patch(id: string, body: { status?: InquiryStatus; notes?: string }) {
    setBusy(true);
    setError("");
    const response = await fetch(`/api/admin/inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = (await response.json()) as { item?: Inquiry; error?: string };
    setBusy(false);
    if (!response.ok || !payload.item) {
      setError(payload.error || "Could not update that inquiry.");
      return;
    }
    replaceItem(payload.item);
  }

  async function resend(id: string) {
    setBusy(true);
    setError("");
    setNotice("");
    const response = await fetch(`/api/admin/inquiries/${id}`, { method: "POST" });
    const payload = (await response.json()) as { item?: Inquiry; error?: string };
    setBusy(false);
    if (payload.item) replaceItem(payload.item);
    if (!response.ok) {
      setError(payload.error || "Email was not sent.");
      return;
    }
    setNotice("Email sent to both inboxes.");
  }

  async function remove(id: string) {
    if (!window.confirm("Remove this inquiry?")) return;
    setBusy(true);
    const response = await fetch(`/api/admin/inquiries/${id}`, { method: "DELETE" });
    setBusy(false);
    if (!response.ok) {
      setError("Could not remove that inquiry.");
      return;
    }
    setItems((current) => current.filter((item) => item.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  async function createClient(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const response = await fetch("/api/admin/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(enroll),
    });
    const payload = (await response.json()) as { item?: Inquiry; error?: string };
    setBusy(false);
    if (!response.ok || !payload.item) {
      setError(payload.error || "Could not enroll that client.");
      return;
    }
    setItems((current) => [payload.item as Inquiry, ...current]);
    setSelectedId(payload.item.id);
    setEnroll(emptyEnroll);
    setEnrollOpen(false);
    setFilter("enrolled");
    setNotice("Client enrolled.");
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  async function testEmail() {
    setBusy(true);
    setError("");
    setNotice("");
    const response = await fetch("/api/admin/test-email", { method: "POST" });
    const payload = (await response.json()) as { error?: string };
    setBusy(false);
    if (!response.ok) {
      setError(payload.error || "Test email failed.");
      return;
    }
    setNotice("Test email sent. Check both inboxes.");
  }

  return (
    <div className="admin-shell">
      <div className="wrap">
        <div className="admin-top">
          <div>
            <Link href="/" className="logo">
              <Logo />
              <span>
                <strong>Code Colleagues</strong>
                <small>Inquiry desk</small>
              </span>
            </Link>
            <h1 style={{ fontSize: "2.4rem", marginTop: 16 }}>Hello, team</h1>
            <p className="fine">
              {counts.new} new {counts.new === 1 ? "inquiry" : "inquiries"} · {counts.enrolled} enrolled
            </p>
          </div>
          <div className="admin-actions">
            <button className="btn btn-green btn-small" type="button" onClick={() => setEnrollOpen((open) => !open)}>
              {enrollOpen ? "Close enroll form" : "Enroll a client"}
            </button>
            <a className="btn btn-ghost btn-small" href="/api/admin/inquiries?format=csv">
              Download CSV
            </a>
            <button className="btn btn-ghost btn-small" type="button" onClick={() => void testEmail()} disabled={busy}>
              Send test email
            </button>
            <button className="btn btn-ghost btn-small" type="button" onClick={() => void logout()}>
              Log out
            </button>
          </div>
        </div>

        {mailConfigured ? (
          <div className="mail-ok">
            <strong>Email is on.</strong>
            <p>Form messages go to {mailTo.join(" and ")}.</p>
          </div>
        ) : null}

        {notice ? <p className="mail-ok">{notice}</p> : null}
        {error ? <p className="form-error">{error}</p> : null}

        {enrollOpen ? (
          <form className="panel form-grid" onSubmit={createClient} style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: "1.8rem" }}>Enroll a client</h2>
            <div className="pair">
              <label>
                Name
                <input
                  required
                  value={enroll.name}
                  onChange={(event) => setEnroll({ ...enroll, name: event.target.value })}
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  placeholder="Optional"
                  value={enroll.email}
                  onChange={(event) => setEnroll({ ...enroll, email: event.target.value })}
                />
              </label>
            </div>
            <div className="pair">
              <label>
                Phone
                <input
                  required
                  value={enroll.phone}
                  onChange={(event) => setEnroll({ ...enroll, phone: event.target.value })}
                />
              </label>
              <label>
                Business
                <input
                  value={enroll.company}
                  onChange={(event) => setEnroll({ ...enroll, company: event.target.value })}
                />
              </label>
            </div>
            <label>
              What they need
              <select
                value={enroll.service}
                onChange={(event) => setEnroll({ ...enroll, service: event.target.value })}
              >
                {serviceOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label>
              Notes about the work
              <textarea
                value={enroll.message}
                onChange={(event) => setEnroll({ ...enroll, message: event.target.value })}
              />
            </label>
            <button className="btn btn-primary" type="submit" disabled={busy}>
              Save as enrolled
            </button>
          </form>
        ) : null}

        <div className="admin-layout">
          <section className="panel">
            <div className="filters">
              {filters.map((item) => (
                <button
                  key={item.id}
                  className="btn btn-ghost btn-small"
                  type="button"
                  aria-pressed={filter === item.id}
                  onClick={() => setFilter(item.id)}
                >
                  {item.label} {counts[item.id]}
                </button>
              ))}
            </div>
            <label className="search">
              Search
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Name, email, phone, or project"
              />
            </label>
            {visible.length === 0 ? (
              <p className="empty">
                {items.length === 0
                  ? "No inquiries yet. When a client uses the form on the website, they show up here."
                  : "Nothing matches this filter."}
              </p>
            ) : (
              <div className="table-wrap">
                <table className="inquiry-table">
                  <thead>
                    <tr>
                      <th>When</th>
                      <th>Client</th>
                      <th>Need</th>
                      <th>Status</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((item) => (
                      <tr
                        key={item.id}
                        aria-selected={item.id === selectedId}
                        onClick={() => setSelectedId(item.id)}
                      >
                        <td data-label="When">{formatWhen(item.createdAt)}</td>
                        <td data-label="Client">
                          <div className="who">
                            <strong>{item.name}</strong>
                            <span>{item.email}</span>
                          </div>
                        </td>
                        <td data-label="Need">{item.service}</td>
                        <td data-label="Status">
                          <span className={`status status-${item.status}`}>{statusLabels[item.status]}</span>
                        </td>
                        <td data-label="Email">
                          <span className={item.emailSent ? "sent-yes" : "sent-no"}>
                            {item.emailSent ? "Sent" : "Not sent"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <aside className="detail-card">
            {selected ? (
              <>
                <p className="kicker">{selected.source === "admin" ? "Enrolled here" : "From the website"}</p>
                <h3>{selected.name}</h3>
                <ul className="meta-list">
                  <li>
                    <span>When</span>
                    {formatWhen(selected.createdAt)}
                  </li>
                  <li>
                    <span>Email</span>
                    <a href={mailAppHref(selected)} target="_blank" rel="noopener noreferrer">
                      {selected.email}
                    </a>
                  </li>
                  <li>
                    <span>Phone</span>
                    <a href={`tel:${selected.phone}`}>{selected.phone}</a>
                  </li>
                  <li>
                    <span>Business</span>
                    {selected.company || "—"}
                  </li>
                  <li>
                    <span>Need</span>
                    {selected.service}
                  </li>
                  <li>
                    <span>Message</span>
                    <p className="message-block">{selected.message || "—"}</p>
                  </li>
                </ul>
                <div className="reply-box">
                  <span>Client mail</span>
                  <a className="client-mail" href={mailAppHref(selected)} target="_blank" rel="noopener noreferrer">
                    {selected.email}
                  </a>
                  <a className="btn btn-green btn-small" href={mailAppHref(selected)} target="_blank" rel="noopener noreferrer">
                    Reply in Gmail
                  </a>
                  <p className="fine">Opens Gmail in a new tab, ready to send from {business.emailBusiness}.</p>
                </div>
                <div className="detail-actions">
                  <button className="btn btn-ghost btn-small" type="button" disabled={busy} onClick={() => void patch(selected.id, { status: "checked" })}>
                    Mark checked
                  </button>
                  <button className="btn btn-green btn-small" type="button" disabled={busy} onClick={() => void patch(selected.id, { status: "enrolled" })}>
                    Mark enrolled
                  </button>
                  <button className="btn btn-ghost btn-small" type="button" disabled={busy} onClick={() => void patch(selected.id, { status: "closed" })}>
                    Close
                  </button>
                  <button className="btn btn-ghost btn-small" type="button" disabled={busy} onClick={() => void resend(selected.id)}>
                    Email both inboxes
                  </button>
                  <button className="btn btn-ghost btn-small" type="button" disabled={busy} onClick={() => void remove(selected.id)}>
                    Remove
                  </button>
                </div>
                <label>
                  Private notes
                  <textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
                </label>
                <button
                  className="btn btn-primary btn-small"
                  type="button"
                  disabled={busy}
                  onClick={() => void patch(selected.id, { notes })}
                >
                  Save notes
                </button>
              </>
            ) : (
              <>
                <h3>Select an inquiry</h3>
                <p className="fine">
                  Open a row to see the client mail and reply in Gmail.
                </p>
              </>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
