// components/GalleryGrid.tsx
import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

type GalleryGridProps = {
  urls: string[];
  maxPerRow?: number; // default 6
};

const GalleryGrid: React.FC<GalleryGridProps> = ({ urls, maxPerRow = 6 }) => {
  const images = useMemo(
    () => (Array.isArray(urls) ? urls.map(String).filter(Boolean) : []),
    [urls]
  );

  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const colsStyle = useMemo(() => {
    const count = Math.min(maxPerRow, Math.max(1, images.length));
    return { ["--mw-cols" as any]: String(count) } as React.CSSProperties;
  }, [images.length, maxPerRow]);

  const openAt = (i: number) => {
    setIdx(i);
    setOpen(true);
  };

  const close = () => setOpen(false);

  const prev = () => setIdx((p) => (p - 1 + images.length) % images.length);
  const next = () => setIdx((p) => (p + 1) % images.length);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };

    window.addEventListener("keydown", onKey);

    // Bloquea scroll del fondo
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, images.length]);

  if (!images.length) return null;

  const modal = open ? (
    <div
      className="fixed inset-0 z-[999999] bg-black/85 backdrop-blur-sm"
      onClick={close}
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-5xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs text-gray-300">
              {idx + 1} / {images.length}
            </p>
            <button
              type="button"
              onClick={close}
              className="rounded-xl border border-white/15 bg-black/40 px-3 py-1.5 text-xs text-gray-200 hover:bg-black/60"
            >
              Cerrar ✕
            </button>
          </div>

          {/* Imagen */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[idx]}
              alt={`Imagen ${idx + 1}`}
              className="w-full max-h-[75vh] object-contain bg-black"
              loading="eager"
            />

            {/* Flechas */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-2xl border border-white/15 bg-black/45 px-3 py-2 text-sm text-gray-100 hover:bg-black/65"
                  aria-label="Anterior"
                  title="Anterior"
                >
                  ◀
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-2xl border border-white/15 bg-black/45 px-3 py-2 text-sm text-gray-100 hover:bg-black/65"
                  aria-label="Siguiente"
                  title="Siguiente"
                >
                  ▶
                </button>
              </>
            )}
          </div>

          <p className="mt-2 text-[11px] text-gray-400">
            Tip: usa ← → del teclado para navegar.
          </p>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      {/* ✅ SOLO el grid (sin título interno para evitar duplicado) */}
      <div style={colsStyle}
        className={[
          "grid gap-3",
          "grid-cols-2",
          "sm:grid-cols-3",
          "md:grid-cols-4",
          "lg:[grid-template-columns:repeat(var(--mw-cols),minmax(0,1fr))]",
        ].join(" ")}
      >
        {images.map((url, i) => (
          <button
            key={`${url}-${i}`}
            type="button"
            onClick={() => openAt(i)}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 aspect-[4/3] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0CE0B2]/40"
            title="Abrir imagen"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`Galería ${i + 1}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              loading="lazy"
            />
            <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </button>
        ))}
      </div>

      {/* ✅ Lightbox en portal (para que fixed sea full-screen real) */}
      {mounted && typeof document !== "undefined" && document.body
        ? createPortal(modal, document.body)
        : null}
    </>
  );
};

export default GalleryGrid;
export { GalleryGrid };
