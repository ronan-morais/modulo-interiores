"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/Icon";

type CarouselProps = {
  label: string;
  tone?: "light" | "dark";
  children: ReactNode;
};

export function Carousel({ label, tone = "light", children }: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ index: 0, total: 0, visible: 1, scrollable: false });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measure = () => {
      const first = track.firstElementChild as HTMLElement | null;
      const gap = parseFloat(getComputedStyle(track).columnGap || "0");
      const step = first
        ? first.getBoundingClientRect().width + gap
        : track.clientWidth;
      const total = track.children.length;
      const visible = step > 0 ? Math.max(1, Math.round(track.clientWidth / step)) : 1;
      const maxScroll = track.scrollWidth - track.clientWidth;

      setView({
        index: step > 0 ? Math.min(total - 1, Math.round(track.scrollLeft / step)) : 0,
        total,
        visible,
        scrollable: maxScroll > 4,
      });
    };

    measure();
    track.addEventListener("scroll", measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(track);

    return () => {
      track.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, []);

  const canGoBack = view.index > 0;
  const canGoForward = view.total > 0 && view.index < view.total - view.visible;

  const step = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const first = track.firstElementChild as HTMLElement | null;
    const gap = parseFloat(getComputedStyle(track).columnGap || "0");
    const distance = first
      ? first.getBoundingClientRect().width + gap
      : track.clientWidth;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    track.scrollBy({ left: distance * direction, behavior: reduce ? "auto" : "smooth" });
  };

  const counter = `${String(view.index + 1).padStart(2, "0")} / ${String(view.total).padStart(2, "0")}`;

  return (
    <div className={tone === "dark" ? "carousel carousel--dark" : "carousel"}>
      <div className="carousel-bar">
        <p className="carousel-count" aria-live="polite">
          {counter}
        </p>
        {view.scrollable ? (
          <div className="carousel-controls">
            <button
              type="button"
              className="carousel-btn"
              onClick={() => step(-1)}
              disabled={!canGoBack}
              aria-label="Ver item anterior"
            >
              <Icon name="arrow-left" size={16} />
            </button>
            <button
              type="button"
              className="carousel-btn"
              onClick={() => step(1)}
              disabled={!canGoForward}
              aria-label="Ver próximo item"
            >
              <Icon name="arrow-right" size={16} />
            </button>
          </div>
        ) : null}
      </div>

      <div
        className="carousel-track"
        ref={trackRef}
        role="group"
        aria-roledescription="carrossel"
        aria-label={label}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
          event.preventDefault();
          step(event.key === "ArrowRight" ? 1 : -1);
        }}
      >
        {children}
      </div>
    </div>
  );
}
