"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { navLinks } from "@/lib/site";

type MobileMenuProps = {
  activeHref?: string;
  variant?: "default" | "back";
};

export function MobileMenu({ activeHref, variant = "default" }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    };

    const desktop = window.matchMedia("(min-width: 721px)");
    const onBreakpoint = () => {
      if (desktop.matches) setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    desktop.addEventListener("change", onBreakpoint);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      desktop.removeEventListener("change", onBreakpoint);
    };
  }, [open]);

  return (
    <div className="mobile-menu" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className="mobile-menu-trigger"
        aria-expanded={open}
        aria-controls="mobile-menu-panel"
        onClick={() => setOpen((current) => !current)}
      >
        <Icon name={open ? "close" : "menu"} size={17} />
        <span>{open ? "Fechar" : "Menu"}</span>
      </button>

      {open ? (
        <div className="mobile-menu-panel" id="mobile-menu-panel">
          <div className="container">
            <nav aria-label="Navegação principal">
              <ul>
                {navLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      aria-current={activeHref === link.href ? "page" : undefined}
                      onClick={() => setOpen(false)}
                    >
                      {link.label}
                      <Icon name="arrow-right" size={15} className="mobile-menu-arrow" />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {variant === "back" ? (
              <Link
                className="btn btn-outline btn-md mobile-menu-cta"
                href="/"
                onClick={() => setOpen(false)}
              >
                <Icon name="arrow-left" size={15} />
                Voltar ao site
              </Link>
            ) : (
              <Link
                className="btn btn-dark btn-md mobile-menu-cta"
                href="/orcamento"
                onClick={() => setOpen(false)}
              >
                Cotação online
                <Icon name="arrow-up-right" size={15} className="icon-arrow-diag" />
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
