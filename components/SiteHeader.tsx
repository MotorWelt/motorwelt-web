// components/SiteHeader.tsx
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

type ActiveTab =
  | "inicio"
  | "noticias"
  | "deportes"
  | "lifestyle"
  | "comunidad"
  | "producciones"
  | "suscripcion";

type SiteHeaderProps = {
  /** resalta la sección activa */
  active?: ActiveTab;
  /** buscador opcional a la derecha */
  search?: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    id?: string;
    /** aria-label si quieres sobreescribir */
    ariaLabel?: string;
  };
  /** slot opcional (ej: selector de “Todo / Series / Clips” en Producciones) */
  rightAddon?: React.ReactNode;
};

export default function SiteHeader({
  active,
  search,
  rightAddon,
}: SiteHeaderProps) {
  const [openNews, setOpenNews] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  // Cierra dropdown al dar click fuera
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (
        !menuRef.current.contains(e.target as Node) &&
        !btnRef.current?.contains(e.target as Node)
      ) {
        setOpenNews(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Teclado: abre/cierra, navega y Esc cierra
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!openNews) return;
      if (e.key === "Escape") {
        setOpenNews(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openNews]);

  const navLinkBase =
    "inline-flex items-center h-10 leading-none transition";
  const navLink =
    "text-gray-200 hover:text-white";
  const navLinkActive =
    "text-white border-b-2 border-[#0CE0B2]";

  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b border-mw-line/70 bg-mw-surface/70 backdrop-blur-md">
      <div className="mx-auto grid h-16 w-full max-w-[1200px] grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 lg:px-8 gap-3">
        {/* Logo */}
        <div className="flex items-center min-w-0">
          <Link
            href="/"
            className="inline-flex items-center gap-2"
            aria-label="Ir al inicio"
          >
            <Image
              src="/brand/motorwelt-logo.png"
              alt="MotorWelt logo"
              width={220}
              height={56}
              priority
              className="h-10 md:h-12 w-auto"
            />
          </Link>
        </div>

        {/* Nav centrado */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            href="/"
            className={`${navLinkBase} ${
              active === "inicio" ? navLinkActive : navLink
            }`}
          >
            Inicio
          </Link>

          {/* Noticias con dropdown accesible */}
          <div className="relative">
            <button
              ref={btnRef}
              type="button"
              className={`${navLinkBase} ${
                active === "noticias" ? navLinkActive : navLink
              }`}
              aria-haspopup="menu"
              aria-expanded={openNews}
              aria-controls="menu-noticias"
              onClick={() => setOpenNews((v) => !v)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setOpenNews(true);
                  // focus primer item tras abrir
                  setTimeout(() => {
                    const first = menuRef.current?.querySelector<HTMLElement>(
                      'a[role="menuitem"]'
                    );
                    first?.focus();
                  }, 0);
                }
              }}
            >
              Noticias
              <svg
                className="ml-2 mt-[1px] opacity-70"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M6 9l6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <div
              ref={menuRef}
              id="menu-noticias"
              role="menu"
              aria-label="Submenú de Noticias"
              className={`absolute left-0 top-full mt-2 z-50 min-w-[180px] rounded-xl border border-mw-line/70 bg-mw-surface/95 backdrop-blur-md p-2 shadow-xl transition
                ${openNews ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 pointer-events-none"}`}
            >
              <Link
                href="/noticias/autos"
                role="menuitem"
                tabIndex={openNews ? 0 : -1}
                className="block rounded-lg px-3 py-2 text-gray-100 hover:bg-white/5 focus:bg-white/5 outline-none"
                onClick={() => setOpenNews(false)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.preventDefault();
                    setOpenNews(false);
                    btnRef.current?.focus();
                  }
                }}
              >
                Autos
              </Link>
              <Link
                href="/noticias/motos"
                role="menuitem"
                tabIndex={openNews ? 0 : -1}
                className="block rounded-lg px-3 py-2 text-gray-100 hover:bg白/5 focus:bg-white/5 outline-none"
                onClick={() => setOpenNews(false)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.preventDefault();
                    setOpenNews(false);
                    btnRef.current?.focus();
                  }
                }}
              >
                Motos
              </Link>
            </div>
          </div>

          <Link
            href="/deportes"
            className={`${navLinkBase} ${
              active === "deportes" ? navLinkActive : navLink
            }`}
          >
            Deportes
          </Link>

          <Link
            href="/lifestyle"
            className={`${navLinkBase} ${
              active === "lifestyle" ? navLinkActive : navLink
            }`}
          >
            Lifestyle
          </Link>

          <Link
            href="/comunidad"
            className={`${navLinkBase} ${
              active === "comunidad" ? navLinkActive : navLink
            }`}
          >
            Comunidad
          </Link>

          <Link
            href="/producciones"
            className={`${navLinkBase} ${
              active === "producciones" ? navLinkActive : navLink
            }`}
          >
            Producciones
          </Link>

          <Link
            href="/suscripcion"
            className={`${navLinkBase} ${
              active === "suscripcion" ? navLinkActive : navLink
            }`}
          >
            <span className="text-white border-2 border-[#FF7A1A] rounded-2xl px-3 py-1.5 shadow-[0_0_18px_rgba(255,122,26,.32),inset_0_0_0_1px_rgba(255,122,26,.12)] hover:bg-white/5">
              Suscripción
            </span>
          </Link>
        </nav>

        {/* Derecha: addon + búsqueda (orden fijo para que no “se pegue”) */}
        <div className="hidden md:flex items-center justify-end gap-3">
          {rightAddon ? (
            <div className="shrink-0">{rightAddon}</div>
          ) : null}
          {search && (
            <div className="relative w-[300px] shrink-0">
              <label htmlFor={search.id ?? "site-search"} className="sr-only">
                {search.ariaLabel ?? "Buscar"}
              </label>
              <input
                id={search.id ?? "site-search"}
                value={search.value}
                onChange={(e) => search.onChange(e.target.value)}
                placeholder={search.placeholder ?? "Buscar…"}
                className="w-full rounded-2xl border border-white/20 bg-black/30 backdrop-blur-md px-4 py-2 text-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
              />
              <span
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-80"
                aria-hidden
              >
                🔎
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
