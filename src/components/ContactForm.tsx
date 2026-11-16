"use client";

import { useEffect, useRef, useState } from "react";
import { serviceOptions } from "@/lib/business";

function NeedMenu() {
  const [value, setValue] = useState<string>(serviceOptions[0]);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={open ? "need-menu is-open" : "need-menu"} ref={rootRef}>
      <button
        type="button"
        className="need-trigger"
        aria-labelledby="need-label"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{value}</span>
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <input type="hidden" name="service" value={value} />
      <div className="need-panel">
        <ul role="listbox" aria-label="What do you need?">
          {serviceOptions.map((option, index) => (
            <li key={option} style={{ "--i": index } as React.CSSProperties}>
              <button
                type="button"
                role="option"
                aria-selected={option === value}
                onClick={() => {
                  setValue(option);
                  setOpen(false);
                }}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function ContactForm() {
  const [startedAt] = useState(() => Date.now());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, startedAt }),
      });
      const raw = await response.text();
      let payload: { error?: string; ok?: boolean; emailed?: boolean } = {};
      try {
        payload = raw ? (JSON.parse(raw) as { error?: string; ok?: boolean; emailed?: boolean }) : {};
      } catch {
        payload = {};
      }
      if (!response.ok || !payload.emailed) {
        setError(payload.error || "We could not email your details. Please write to codecolleagues@gmail.com.");
        setPending(false);
        return;
      }
      setDone(true);
    } catch {
      setError("We could not send that just now. Please call or email us.");
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="form-success" role="status">
        <h3>Details sent.</h3>
        <p>Your name, phone, and project note were emailed to the studio. If you left an email, the team will reply there. Otherwise they will use your phone number.</p>
        <button className="btn btn-ghost" type="button" onClick={() => setDone(false)} style={{ marginTop: 16 }}>
          Send another
        </button>
      </div>
    );
  }

  return (
    <form className="form-grid" onSubmit={onSubmit} noValidate>
      <div className="hp" aria-hidden="true">
        <label>
          Company website
          <input name="company_site" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="pair">
        <label>
          Name
          <input name="name" autoComplete="name" required placeholder="Your name" />
        </label>
        <label>
          Email
          <input name="email" type="email" autoComplete="email" placeholder="Optional" />
        </label>
      </div>
      <div className="pair">
        <label>
          Phone
          <input name="phone" type="tel" autoComplete="tel" required placeholder="10-digit mobile" />
        </label>
        <label>
          Business name
          <input name="company" autoComplete="organization" placeholder="Optional" />
        </label>
      </div>
      <div className="need-field">
        <span id="need-label">What do you need?</span>
        <NeedMenu />
      </div>
      <label>
        About the project
        <textarea
          name="message"
          required
          minLength={10}
          placeholder="What should the website, app, or database do?"
        />
      </label>
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      <button className="btn btn-primary" type="submit" disabled={pending}>
        {pending ? "Sending…" : "Enroll"}
      </button>
      <p className="form-note">
        This message is emailed to the studio. We use it only to reply about your project.
      </p>
    </form>
  );
}
