"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { projects } from "@/lib/business";

export function WorkCases() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setClosing(true);
    }
    document.body.classList.add("modal-lock");
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("modal-lock");
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!closing || !open) return;
    const timer = window.setTimeout(() => {
      setOpen(false);
      setClosing(false);
      window.setTimeout(() => openRef.current?.focus(), 0);
    }, 280);
    return () => window.clearTimeout(timer);
  }, [closing, open]);

  function close() {
    setClosing(true);
  }

  return (
    <>
      <div className="work-cue">
        <span className="work-cue-text">Click to see the details</span>
        <button ref={openRef} type="button" className="btn btn-light work-open" onClick={() => setOpen(true)}>
          Open
        </button>
      </div>

      {mounted && open
        ? createPortal(
            <div className={closing ? "modal-back is-closing" : "modal-back"}>
              <div
                className="modal work-list"
                role="dialog"
                aria-modal="true"
                aria-labelledby="work-modal-title"
              >
                <div className="work-modal-bar">
                  <h2 id="work-modal-title">Work already delivered.</h2>
                  <button ref={closeRef} type="button" className="modal-close" onClick={close} aria-label="Close">
                    <svg viewBox="0 0 24 24" aria-hidden>
                      <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                <div className="work-modal-list">
                  {projects.map((project, index) => (
                    <article className={index % 2 ? "case reverse" : "case"} key={project.name}>
                      <div className={`case-mark ${project.variant}`}>
                        <p>{project.field}</p>
                        <p className="mark-name">{project.mark}</p>
                        <p>{project.line}</p>
                      </div>
                      <div className="case-copy">
                        <p className="field">{project.field}</p>
                        <h3>{project.name}</h3>
                        <p>{project.summary}</p>
                        <ul className="tags">
                          {project.tags.map((tag) => (
                            <li key={tag}>{tag}</li>
                          ))}
                        </ul>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
