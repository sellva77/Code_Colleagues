"use client";

import { useEffect } from "react";

export function SiteMotion() {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce || nodes.length === 0) {
      nodes.forEach((node) => node.classList.add("is-in"));
      return;
    }

    let pending = nodes.length;
    let frame = 0;

    const finish = () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      observer.disconnect();
    };

    const done = (node: HTMLElement) => {
      if (node.classList.contains("is-in")) return;
      node.classList.add("is-in");
      pending -= 1;
      if (pending <= 0) finish();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          done(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0, rootMargin: "120px" },
    );

    const scan = () => {
      frame = 0;
      nodes.forEach((node) => {
        if (node.classList.contains("is-in")) return;
        const rect = node.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          done(node);
          observer.unobserve(node);
        }
      });
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(scan);
    };

    nodes.forEach((node) => observer.observe(node));
    scan();
    window.scrollTo(0, 0);
    document.documentElement.classList.add("motion");
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      finish();
      document.documentElement.classList.remove("motion");
    };
  }, []);

  return null;
}
