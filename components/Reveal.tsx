"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Reveals `[data-reveal]` blocks as they enter the viewport and keeps the
 * header compact once the page is scrolled. Elements stay visible without
 * JavaScript; the `reveal-on` class is set inline in <html> before paint.
 */
export function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!nodes.length) return;

    if (reduceMotion.matches || !("IntersectionObserver" in window)) {
      for (const node of nodes) node.classList.add("is-revealed");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    const viewportGuard = window.innerHeight * 0.92;
    for (const node of nodes) {
      if (node.getBoundingClientRect().top < viewportGuard) {
        node.classList.add("is-revealed");
      } else {
        node.setAttribute("data-reveal-pending", "");
        observer.observe(node);
      }
    }

    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    const header = document.querySelector(".site-header");
    if (!header) return;

    const sync = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    sync();
    window.addEventListener("scroll", sync, { passive: true });

    return () => window.removeEventListener("scroll", sync);
  }, [pathname]);

  return null;
}
