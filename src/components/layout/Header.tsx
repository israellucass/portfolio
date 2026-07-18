"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { navItems, site } from "@/data/site";
import { SocialLinks } from "@/components/layout/SocialLinks";

function isActive(pathname: string, href: string) {
  if (href === "/about") {
    return pathname === "/about";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
}

function CloseMenuIcon() {
  return (
    <span className="relative block h-6 w-6" aria-hidden>
      <span className="absolute left-1/2 top-1/2 h-0.5 w-6 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[var(--text-primary)]" />
      <span className="absolute left-1/2 top-1/2 h-0.5 w-6 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-[var(--text-primary)]" />
    </span>
  );
}

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeMenuRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const main = document.getElementById("main");
    if (!main) return;

    if (menuOpen) {
      main.setAttribute("inert", "");
    } else {
      main.removeAttribute("inert");
    }

    return () => {
      main.removeAttribute("inert");
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;

    closeMenuRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        return;
      }

      if (event.key !== "Tab" || !menuRef.current) return;

      const focusable = getFocusableElements(menuRef.current);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        id="top"
        className={`site-header fixed inset-x-0 top-0 z-50 flex h-14 items-center bg-[var(--background)] px-[5%] transition-shadow duration-300 md:px-[6%] lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-4 lg:px-[8%] ${
          scrolled ? "shadow-[0_1px_3px_rgba(0,0,0,0.1)]" : ""
        }`}
      >
        <Link
          href="/"
          className="focus-ring font-logo min-w-0 truncate justify-self-start pr-10 text-[22px] font-bold leading-7 text-[var(--text-primary)] transition-colors hover:text-[var(--text-muted)] sm:text-[26px] sm:leading-8 lg:pr-0 lg:text-[28px] xl:text-[30px]"
        >
          {site.tagline}
        </Link>

        <nav className="hidden min-w-0 justify-self-center lg:block">
          <div className="nav-container flex flex-nowrap items-center justify-center gap-x-6">
            {navItems.map((item) => (
              <div
                key={item.href}
                className={`shrink-0 ${item.href === "/about" ? "page-title" : "gallery-title"}`}
              >
                <Link
                  href={item.href}
                  className={`focus-ring font-body whitespace-nowrap text-sm leading-5 transition-colors xl:text-base xl:leading-6 ${
                    isActive(pathname, item.href)
                      ? "font-bold text-[var(--text-primary)]"
                      : "font-normal text-[var(--text-primary)] hover:text-[var(--text-muted)] hover:underline"
                  }`}
                >
                  {item.label}
                </Link>
              </div>
            ))}
          </div>
        </nav>

        <div className="hidden justify-self-end lg:block">
          <SocialLinks iconClassName="[&_svg]:h-7 [&_svg]:w-7 xl:[&_svg]:h-8 xl:[&_svg]:w-8" />
        </div>

        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="focus-ring absolute right-[5%] top-1/2 flex h-10 w-6 -translate-y-1/2 flex-col justify-center gap-1 lg:hidden"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span
            className={`h-0.5 w-6 bg-[var(--text-primary)] transition-transform ${menuOpen ? "translate-y-1.5 rotate-45" : ""}`}
          />
          <span
            className={`h-0.5 w-6 bg-[var(--text-primary)] transition-opacity ${menuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`h-0.5 w-6 bg-[var(--text-primary)] transition-transform ${menuOpen ? "-translate-y-1.5 -rotate-45" : ""}`}
          />
        </button>
      </header>

      {menuOpen && (
        <div
          ref={menuRef}
          className="fixed inset-0 z-[99999] flex flex-col overflow-auto overscroll-contain bg-[var(--background)] px-[5%] pt-[50px] text-center lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <button
            ref={closeMenuRef}
            type="button"
            aria-label="Close menu"
            className="focus-ring absolute right-[5%] top-7 flex h-10 w-10 -translate-y-1/2 items-center justify-center"
            onClick={() => setMenuOpen(false)}
          >
            <CloseMenuIcon />
          </button>

          <nav className="my-auto w-full pb-20">
            {navItems.map((item) => (
              <div key={item.href} className="pb-[30px]">
                <Link
                  href={item.href}
                  className={`focus-ring font-body text-[22px] leading-8 ${
                    isActive(pathname, item.href)
                      ? "font-bold text-[var(--text-primary)]"
                      : "font-normal text-[var(--text-primary)]"
                  }`}
                >
                  {item.label}
                </Link>
              </div>
            ))}
          </nav>

          <div className="fixed inset-x-0 bottom-0 border-t border-black/10 bg-[var(--background)] px-[5%] py-4">
            <SocialLinks className="justify-center" />
          </div>
        </div>
      )}

      <div className="header-placeholder h-14" aria-hidden />
    </>
  );
}
