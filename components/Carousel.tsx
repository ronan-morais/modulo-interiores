"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/Icon";

type CarouselProps = {
  label: string;
  /**
   * Min viewport width (px) from which the items render as a static grid
   * instead of a carousel. Omit to always use the carousel.
   */
  gridFrom?: number;
  children: ReactNode;
};

export function Carousel({ label, gridFrom, children }: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isGrid, setIsGrid] = useState(false);
  const [view, setView] = useState({
    index: 0,
    total: 0,
    visible: 1,
    scrollable: false,
  });

  useEffect(() => {
    if (!gridFrom) return;

    const query = window.matchMedia(`(min-width: ${gridFrom}px)`);
    const sync = () => setIsGrid(query.matches);

    sync();
    query.addEventListener("change", sync);

    return () => query.removeEventListener("change", sync);
  }, [gridFrom]);

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
      const visible =
        step > 0 ? Math.max(1, Math.round(track.clientWidth / step)) : 1;
      const maxScroll = track.scrollWidth - track.clientWidth;

      setView({
        index:
          step > 0 ? Math.min(total - 1, Math.round(track.scrollLeft / step)) : 0,
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

    track.scrollBy({
      left: distance * direction,
      behavior: reduce ? "auto" : "smooth",
    });
  };

  const counter = `${String(view.index + 1).padStart(2, "0")} / ${String(
    view.total,
  ).padStart(2, "0")}`;

  return (
    <div
      className={
        isGrid
          ? "carousel is-grid"
          : view.scrollable
            ? "carousel is-scrollable"
            : "carousel"
      }
    >
      {isGrid ? null : (
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
      )}

      <div
        className="carousel-track"
        ref={trackRef}
        role={isGrid ? undefined : "group"}
        aria-roledescription={isGrid ? undefined : "carrossel"}
        aria-label={isGrid ? undefined : label}
        tabIndex={isGrid ? undefined : 0}
        onKeyDown={
          isGrid
            ? undefined
            : (event) => {
                if (event.key !== "ArrowLeft" && event.key !== "ArrowRight")
                  return;
                event.preventDefault();
                step(event.key === "ArrowRight" ? 1 : -1);
              }
        }
      >
        {children}
      </div>
    </div>
  );
}
