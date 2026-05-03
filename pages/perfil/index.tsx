// pages/perfil/index.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import type { GetServerSideProps } from "next";
import Link from "next/link";
import Image from "next/image";
import Seo from "../../components/Seo";
import ProfileButton from "../../components/ProfileButton";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Country, State } from "country-state-city";

const nextI18NextConfig = require("../../next-i18next.config.js");

type Option = {
  label: string;
  value: string;
};

type SubmitState = "idle" | "loading" | "success" | "error";

const INTEREST_OPTIONS: Option[] = [
  { label: "Autos", value: "autos" },
  { label: "Motos", value: "motos" },
  { label: "Tuning", value: "tuning" },
  { label: "Deportes", value: "deportes" },
  { label: "Lifestyle", value: "lifestyle" },
  { label: "Comunidad", value: "comunidad" },
];

const SEX_OPTIONS: Option[] = [
  { label: "Hombre", value: "hombre" },
  { label: "Mujer", value: "mujer" },
  { label: "Otro", value: "otro" },
];

type PerfilPageSettings = {
  heroImageUrl: string;
};

const DEFAULT_PERFIL_PAGE_SETTINGS: PerfilPageSettings = {
  heroImageUrl: "",
};

type ButtonVariant = "cyan" | "pink" | "ghost";

const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    children: React.ReactNode;
  }
> = ({ className = "", children, variant = "cyan", ...props }) => {
  const base =
    "inline-flex items-center justify-center rounded-2xl px-5 py-2.5 font-semibold text-white transition focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60";

  const styles: Record<ButtonVariant, string> = {
    cyan: "border border-white/[0.06] bg-white/[0.035] shadow-[0_0_18px_rgba(12,224,178,.22),inset_0_0_0_1px_rgba(255,255,255,.035)] hover:bg-white/5 hover:shadow-[0_0_24px_rgba(12,224,178,.32),inset_0_0_0_1px_rgba(255,255,255,.05)] focus-visible:ring-[#0CE0B2]/35",
    pink: "border border-white/[0.06] bg-white/[0.035] shadow-[0_0_18px_rgba(255,122,26,.24),inset_0_0_0_1px_rgba(255,255,255,.035)] hover:bg-white/5 hover:shadow-[0_0_24px_rgba(255,122,26,.34),inset_0_0_0_1px_rgba(255,255,255,.05)] focus-visible:ring-[#FF7A1A]/35",
    ghost:
      "border border-white/[0.06] bg-white/[0.035] text-gray-100 hover:bg-white/5 hover:border-white/12 focus-visible:ring-white/20",
  };

  return (
    <button {...props} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </button>
  );
};

function toggleValue(list: string[], value: string) {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

function readCookie(name: string) {
  if (typeof document === "undefined") return "";
  const escaped = name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  const match = document.cookie.match(
    new RegExp("(^|;\\s*)" + escaped + "=([^;]+)"),
  );
  return match ? decodeURIComponent(match[2]) : "";
}

function SearchableSelect({
  label,
  value,
  options,
  placeholder,
  disabled = false,
  onChange,
}: {
  label: string;
  value: string;
  options: Option[];
  placeholder: string;
  disabled?: boolean;
  onChange: (option: Option) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options.slice(0, 80);

    return options
      .filter((option) => option.label.toLowerCase().includes(q))
      .slice(0, 80);
  }, [options, query]);

  return (
    <div className="relative">
      <label className="block">
        <span className="text-xs uppercase tracking-[0.18em] text-gray-400">
          {label}
        </span>
        <input
          type="text"
          value={query}
          disabled={disabled}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onBlur={() => {
            window.setTimeout(() => setOpen(false), 140);
          }}
          className="mt-2 w-full rounded-2xl border border-white/[0.08] bg-black/35 px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-[#0CE0B2]/50 focus:ring-2 focus:ring-[#0CE0B2]/15 disabled:cursor-not-allowed disabled:opacity-55"
          placeholder={placeholder}
          autoComplete="off"
        />
      </label>

      {open && !disabled && (
        <div className="absolute left-0 right-0 z-40 mt-2 max-h-[260px] overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#041210]/95 p-1 shadow-2xl backdrop-blur-xl sidebar-scroll">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(option);
                  setQuery(option.label);
                  setOpen(false);
                }}
                className={`block w-full rounded-xl px-3 py-2 text-left text-sm transition hover:bg-white/[0.06] ${
                  option.label === value
                    ? "bg-[#0CE0B2]/10 text-white"
                    : "text-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))
          ) : (
            <div className="px-3 py-3 text-sm text-gray-400">
              No encontramos resultados.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

async function uploadImageToSanity(file: File) {
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch("/api/ai/admin/content/upload-image", {
    method: "POST",
    body: fd,
  });

  const data = await res.json();
  if (!res.ok || !data?.ok) {
    throw new Error(data?.error || "Upload failed");
  }

  return data as { ok: true; assetId: string; url: string };
}

function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const navClass =
    "inline-flex h-10 items-center leading-none text-gray-200 hover:text-white";

  const mobileLinkClass =
    "block w-full rounded-xl px-3 py-3 text-base text-gray-100 hover:bg-white/5";

  return (
    <>
      <header className="fixed left-0 top-0 z-50 w-full border-b border-white/[0.06] bg-mw-surface/70 backdrop-blur-md">
        <div className="mx-auto grid h-16 w-full max-w-[1440px] grid-cols-[auto_1fr_auto] items-center px-4 sm:px-6 xl:px-10 2xl:max-w-[1560px]">
          <div className="flex items-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2"
              aria-label="Ir al inicio MotorWelt"
            >
              <Image
                src="/brand/motorwelt-logo.png"
                alt="MotorWelt logo"
                width={280}
                height={64}
                priority
                className="logo-glow h-10 w-auto sm:h-11 md:h-12 lg:h-14"
              />
            </Link>
          </div>

          <div className="hidden items-center justify-center md:flex">
            <nav className="flex items-center gap-6 text-sm font-medium xl:gap-8 xl:text-[15px]">
              <Link href="/tuning" className={navClass}>
                Tuning
              </Link>
              <Link href="/noticias/autos" className={navClass}>
                Autos
              </Link>
              <Link href="/noticias/motos" className={navClass}>
                Motos
              </Link>
              <Link href="/deportes" className={navClass}>
                Deportes
              </Link>
              <Link href="/lifestyle" className={navClass}>
                Lifestyle
              </Link>
              <Link href="/comunidad" className={navClass}>
                Comunidad
              </Link>
            </nav>
          </div>

          <div className="hidden items-center justify-end md:flex">
            <ProfileButton />
          </div>

          <div className="flex items-center justify-end gap-2 md:hidden">
            <ProfileButton />
            <button
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-mw-surface/60 backdrop-blur-md hover:bg-white/5 focus:outline-none"
              aria-label="Abrir menú"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <aside
            id="mobile-menu"
            className="absolute right-0 top-0 h-full w-[88%] max-w-[340px] overflow-y-auto border-l border-white/[0.06] bg-mw-surface/95 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-4">
              <Image
                src="/brand/motorwelt-logo.png"
                alt="MotorWelt logo"
                width={140}
                height={32}
                className="h-8 w-auto"
              />
              <button
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/5"
                aria-label="Cerrar menú"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M6 6l12 12M18 6l-12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <nav className="px-4 py-3">
              <Link
                href="/tuning"
                className={mobileLinkClass}
                onClick={() => setMobileOpen(false)}
              >
                Tuning
              </Link>
              <Link
                href="/noticias/autos"
                className={mobileLinkClass}
                onClick={() => setMobileOpen(false)}
              >
                Autos
              </Link>
              <Link
                href="/noticias/motos"
                className={mobileLinkClass}
                onClick={() => setMobileOpen(false)}
              >
                Motos
              </Link>
              <Link
                href="/deportes"
                className={mobileLinkClass}
                onClick={() => setMobileOpen(false)}
              >
                Deportes
              </Link>
              <Link
                href="/lifestyle"
                className={mobileLinkClass}
                onClick={() => setMobileOpen(false)}
              >
                Lifestyle
              </Link>
              <Link
                href="/comunidad"
                className={mobileLinkClass}
                onClick={() => setMobileOpen(false)}
              >
                Comunidad
              </Link>
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}

function Footer({ year }: { year: number }) {
  return (
    <footer className="relative z-10 mt-12 border-t border-white/[0.08] bg-mw-surface/70 py-10 text-gray-300 backdrop-blur-md">
      <div className="mx-auto grid w-full max-w-[1440px] gap-8 px-4 sm:px-6 md:grid-cols-3 xl:px-10 2xl:max-w-[1560px]">
        <div>
          <Image
            src="/brand/motorwelt-logo.png"
            alt="MotorWelt logo"
            width={160}
            height={36}
            className="logo-glow h-9 w-auto"
          />
          <p className="mt-2 text-sm">
            Cultura automotriz, motociclismo, tuning y comunidad con enfoque
            visual, editorial y aspiracional.
          </p>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-white">Links</h4>
          <ul className="mt-2 space-y-2 text-sm">
            <li>
              <Link href="/about" className="hover:text-white">
                Acerca de
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white">
                Contacto
              </Link>
            </li>
            <li>
              <Link href="/terminos" className="hover:text-white">
                Términos y condiciones
              </Link>
            </li>
            <li>
              <Link href="/privacidad" className="hover:text-white">
                Política de privacidad
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-white">Socials</h4>
          <div className="mt-2 flex gap-4">
            <a
              href="https://www.instagram.com/motorwelt_?igsh=Nmc4bGRmdmJsenBm"
              target="_blank"
              rel="noreferrer"
              className="text-[#43A1AD] hover:text-white"
            >
              IG
            </a>
            <a
              href="https://www.facebook.com/share/18JRxV8AAu/"
              target="_blank"
              rel="noreferrer"
              className="text-[#43A1AD] hover:text-white"
            >
              FB
            </a>
            <a
              href="https://www.tiktok.com/@itsgabicho?_r=1&_t=ZS-95i81zqyEei"
              target="_blank"
              rel="noreferrer"
              className="text-[#43A1AD] hover:text-white"
            >
              TikTok
            </a>
            <a
              href="https://youtube.com/@motorweltmx?si=mNFID1x-2Z81Q4yo"
              target="_blank"
              rel="noreferrer"
              className="text-[#43A1AD] hover:text-white"
            >
              YouTube
            </a>
          </div>
        </div>
      </div>

      <p className="mt-6 px-4 text-center text-xs text-gray-500">
        © {year} MotorWelt. Todos los derechos reservados.
      </p>
    </footer>
  );
}

export default function PerfilPage({
  year,
  initialPageSettings = DEFAULT_PERFIL_PAGE_SETTINGS,
}: {
  year: number;
  initialPageSettings?: PerfilPageSettings;
}) {
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("hombre");
  const [country, setCountry] = useState("México");
  const [countryIsoCode, setCountryIsoCode] = useState("MX");
  const [city, setCity] = useState("");
  const [interests, setInterests] = useState<string[]>([
    "autos",
    "motos",
    "tuning",
  ]);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");
  const [canEditPage, setCanEditPage] = useState(false);
  const [spectatorMode, setSpectatorMode] = useState(false);
  const [pageSettings, setPageSettings] = useState<PerfilPageSettings>(
    initialPageSettings || DEFAULT_PERFIL_PAGE_SETTINGS,
  );
  const [pageError, setPageError] = useState<string | null>(null);
  const heroInputRef = useRef<HTMLInputElement | null>(null);
  const countryOptions = useMemo<Option[]>(() => {
    return Country.getAllCountries()
      .map((item) => ({
        label: item.name,
        value: item.isoCode,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  const cityOptions = useMemo<Option[]>(() => {
    if (!countryIsoCode) return [];

    const states = State.getStatesOfCountry(countryIsoCode) || [];
    const seen = new Set<string>();

    return states
      .map((item) => item.name)
      .filter((name) => {
        const key = name.trim().toLowerCase();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((name) => ({ label: name, value: name }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [countryIsoCode]);

  const locationLabel = countryIsoCode === "MX" ? "Estado" : "Estado / provincia";

  const canSubmit = useMemo(() => {
    const numericAge = Number(age);
    return (
      name.trim().length > 1 &&
      lastName.trim().length > 1 &&
      email.trim().includes("@") &&
      Number.isFinite(numericAge) &&
      numericAge >= 13 &&
      numericAge <= 100 &&
      sex.trim().length > 0 &&
      country.trim().length > 1 &&
      city.trim().length > 1
    );
  }, [name, lastName, email, age, sex, country, city]);

  useEffect(() => {
    let role = readCookie("mw_role");

    if (!role && typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("mw_admin_user");
        if (raw) {
          const parsed = JSON.parse(raw);
          role = parsed?.role || "";
        }
      } catch {
        // ignore
      }
    }

    setCanEditPage(role === "admin" || role === "editor");
  }, []);

  useEffect(() => {
    setPageSettings(initialPageSettings || DEFAULT_PERFIL_PAGE_SETTINGS);
  }, [initialPageSettings]);

  async function persistPageSettings(next: PerfilPageSettings) {
    setPageError(null);

    try {
      const res = await fetch("/api/ai/admin/home/save", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pageKey: "perfil",
          settings: next,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "No se pudo guardar la portada.");
      }

      setPageSettings(next);
    } catch (err: any) {
      setPageError(err?.message || "No se pudo guardar la portada.");
    }
  }

  async function handleHeroImagePick(files?: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    try {
      setPageError(null);
      const uploaded = await uploadImageToSanity(file);
      await persistPageSettings({ heroImageUrl: uploaded.url });
    } catch (err: any) {
      setPageError(err?.message || "No se pudo subir la portada.");
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitState("loading");
    setMessage("");

    try {
      const res = await fetch("/api/subscription/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          lastName,
          email,
          age: Number(age),
          sex,
          country,
          city,
          interests,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "No se pudo guardar el registro.");
      }

      setSubmitState("success");
      setMessage("Registro guardado. Ya formas parte de la lista MotorWelt.");
    } catch (err: any) {
      setSubmitState("error");
      setMessage(err?.message || "No se pudo guardar el registro.");
    }
  }

  return (
    <>
      <Seo
        title="Perfil | MotorWelt"
        description="Regístrate para recibir novedades editoriales, experiencias y contenido especial de MotorWelt."
      />

      <input
        ref={heroInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          void handleHeroImagePick(e.target.files);
          e.currentTarget.value = "";
        }}
      />

      <div className="relative min-h-screen overflow-x-hidden text-gray-100">
        <div className="mw-global-bg" aria-hidden>
          <div className="mw-global-base" />
          <div className="streak-wrap" style={{ top: "8%", left: "-34%" }}>
            <div className="streak streak-cool dir-fwd" />
          </div>
          <div className="streak-wrap" style={{ top: "22%", left: "-28%" }}>
            <div className="streak streak-warm dir-rev" />
          </div>
          <div className="streak-wrap" style={{ top: "42%", left: "-36%" }}>
            <div className="streak streak-lime dir-fwd" />
          </div>
          <div className="streak-wrap" style={{ top: "64%", left: "-26%" }}>
            <div className="streak streak-cool dir-rev" />
          </div>
          <div className="streak-wrap" style={{ top: "82%", left: "-32%" }}>
            <div className="streak streak-warm dir-fwd" />
          </div>
        </div>

        {canEditPage && (
          <div className="fixed bottom-4 left-4 z-[80] hidden rounded-2xl border border-[#0CE0B2]/25 bg-black/80 px-4 py-3 text-xs text-white backdrop-blur md:block">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-[#0CE0B2] animate-pulse" />
              <span>
                {spectatorMode ? "Vista espectador" : "Modo edición perfil"}
              </span>
            </div>
            {pageError && <div className="mt-1 text-red-300">{pageError}</div>}
            <button
              type="button"
              onClick={() => setSpectatorMode((v) => !v)}
              className="mt-2 rounded-full border border-white/[0.1] bg-black/70 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur hover:bg-black/90"
            >
              {spectatorMode ? "Volver a editar" : "Ver como espectador"}
            </button>
          </div>
        )}

        <SiteHeader />

        <main className="relative z-10 pt-16 lg:pt-[72px]">
          <section className="relative overflow-hidden">
            <div className="absolute inset-0">
              <Image
                src={pageSettings.heroImageUrl || "/images/noticia-1.jpg"}
                alt="Perfil MotorWelt"
                fill
                sizes="100vw"
                priority
                className="object-cover"
                style={{ filter: "brightness(.3) saturate(1.12)" }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/45 to-[#041210]" />
            </div>

            {canEditPage && !spectatorMode && (
              <div className="absolute right-4 top-20 z-20 hidden flex-wrap gap-2 md:flex">
                <button
                  type="button"
                  onClick={() => heroInputRef.current?.click()}
                  className="rounded-full border border-white/[0.1] bg-black/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur hover:bg-black/90"
                >
                  Cambiar portada
                </button>
              </div>
            )}

            <div className="relative mx-auto flex min-h-[52svh] w-full max-w-[1440px] items-end px-4 pb-10 pt-20 sm:px-6 xl:px-10 2xl:max-w-[1560px] lg:min-h-[58vh] lg:pb-14">
              <div className="max-w-5xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-black/30 px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-gray-200 backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-[#0CE0B2]" />
                  MotorWelt
                </div>

                <h1 className="font-display text-[2.6rem] font-extrabold leading-[0.92] tracking-tight text-white sm:text-5xl md:text-6xl xl:text-[5.35rem]">
                  Tu acceso al universo MotorWelt
                </h1>

                <p className="mt-5 max-w-4xl text-base leading-relaxed text-gray-200 sm:text-lg md:text-xl xl:text-[1.35rem]">
                  Regístrate para recibir novedades editoriales, futuras
                  experiencias, contenido especial y avisos de comunidad.
                </p>
              </div>
            </div>
          </section>

          <section className="py-10 sm:py-12">
            <div className="mx-auto grid w-full max-w-[1440px] gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] xl:px-10 2xl:max-w-[1560px]">
              <article className="rounded-[30px] border border-white/[0.06] bg-black/25 p-5 backdrop-blur-md sm:p-8 xl:p-10">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#FF7A1A]">
                  Qué es MotorWelt
                </p>
                <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
                  Cultura automotriz con enfoque editorial, visual y
                  aspiracional.
                </h2>
                <p className="mt-5 text-base leading-8 text-gray-200 sm:text-[1.05rem]">
                  MotorWelt reúne autos, motos, tuning, deporte motor, lifestyle
                  y comunidad en un solo espacio. La idea es crear una
                  plataforma que informe, conecte y active experiencias
                  alrededor de la cultura del motor.
                </p>
                <p className="mt-4 text-base leading-8 text-gray-300 sm:text-[1.05rem]">
                  Por ahora este registro funcionará como una lista para
                  mantenerte al tanto de lanzamientos, notas destacadas, eventos
                  y futuras dinámicas. Las membresías, planes y beneficios se
                  integrarán más adelante.
                </p>
              </article>

              <form
                onSubmit={handleSubmit}
                className="rounded-[30px] border border-white/[0.06] bg-mw-surface/70 p-5 backdrop-blur-md sm:p-8 xl:p-10"
              >
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#0CE0B2]">
                  Registro
                </p>
                <h2 className="mt-3 font-display text-3xl font-bold text-white">
                  Recibe novedades de MotorWelt
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-gray-300">
                  Déjanos tus datos y selecciona los temas que más te interesan.
                  Tu registro se guardará en Sanity para integrarlo después con
                  newsletter, CRM o membresías.
                </p>

                <div className="mt-7 grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs uppercase tracking-[0.18em] text-gray-400">
                      Nombre
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-white/[0.08] bg-black/35 px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-[#0CE0B2]/50 focus:ring-2 focus:ring-[#0CE0B2]/15"
                      placeholder="Tu nombre"
                      autoComplete="given-name"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs uppercase tracking-[0.18em] text-gray-400">
                      Apellido
                    </span>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-white/[0.08] bg-black/35 px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-[#0CE0B2]/50 focus:ring-2 focus:ring-[#0CE0B2]/15"
                      placeholder="Tu apellido"
                      autoComplete="family-name"
                    />
                  </label>

                  <label className="block sm:col-span-2">
                    <span className="text-xs uppercase tracking-[0.18em] text-gray-400">
                      Correo electrónico
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-white/[0.08] bg-black/35 px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-[#0CE0B2]/50 focus:ring-2 focus:ring-[#0CE0B2]/15"
                      placeholder="correo@ejemplo.com"
                      autoComplete="email"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs uppercase tracking-[0.18em] text-gray-400">
                      Edad
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={age}
                      onChange={(e) => {
                        const onlyNumbers = e.target.value.replace(/\D/g, "").slice(0, 3);
                        setAge(onlyNumbers);
                      }}
                      className="mt-2 w-full rounded-2xl border border-white/[0.08] bg-black/35 px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-[#0CE0B2]/50 focus:ring-2 focus:ring-[#0CE0B2]/15"
                      placeholder="Ej. 28"
                      autoComplete="off"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs uppercase tracking-[0.18em] text-gray-400">
                      Sexo
                    </span>
                    <select
                      value={sex}
                      onChange={(e) => setSex(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-white/[0.08] bg-black/35 px-4 py-3 text-white outline-none transition focus:border-[#0CE0B2]/50 focus:ring-2 focus:ring-[#0CE0B2]/15"
                    >
                      {SEX_OPTIONS.map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                          className="bg-[#041210] text-white"
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <SearchableSelect
                    label="País"
                    value={country}
                    options={countryOptions}
                    placeholder="Escribe para buscar tu país"
                    onChange={(option) => {
                      setCountry(option.label);
                      setCountryIsoCode(option.value);
                      setCity("");
                    }}
                  />

                  <SearchableSelect
                    label={locationLabel}
                    value={city}
                    options={cityOptions}
                    placeholder={
                      countryIsoCode
                        ? `Escribe para buscar ${locationLabel.toLowerCase()}`
                        : "Primero selecciona un país"
                    }
                    disabled={!countryIsoCode}
                    onChange={(option) => setCity(option.label)}
                  />
                </div>

                <div className="mt-7">
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
                    Intereses
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {INTEREST_OPTIONS.map((option) => {
                      const active = interests.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            setInterests((list) =>
                              toggleValue(list, option.value),
                            )
                          }
                          className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                            active
                              ? "border-[#0CE0B2]/45 bg-[#0CE0B2]/10 text-white shadow-[0_0_18px_rgba(12,224,178,.16)]"
                              : "border-white/[0.08] bg-white/[0.035] text-gray-300 hover:bg-white/5"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button
                    type="submit"
                    variant="cyan"
                    disabled={!canSubmit || submitState === "loading"}
                  >
                    {submitState === "loading"
                      ? "Guardando…"
                      : "Guardar registro"}
                  </Button>

                  <p className="text-xs leading-relaxed text-gray-400">
                    Sin pagos por ahora. Las membresías y planes se integrarán
                    más adelante.
                  </p>
                </div>

                {message ? (
                  <div
                    className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${
                      submitState === "success"
                        ? "border-[#0CE0B2]/25 bg-[#0CE0B2]/10 text-[#B8FFF0]"
                        : "border-red-400/25 bg-red-500/10 text-red-200"
                    }`}
                  >
                    {message}
                  </div>
                ) : null}

                <p className="mt-5 text-xs leading-relaxed text-gray-500">
                  Al usar MotorWelt aceptas nuestros{" "}
                  <Link
                    href="/terminos"
                    className="text-[#43A1AD] hover:text-white"
                  >
                    Términos y condiciones
                  </Link>{" "}
                  y la{" "}
                  <Link
                    href="/privacidad"
                    className="text-[#43A1AD] hover:text-white"
                  >
                    Política de privacidad
                  </Link>
                  .
                </p>
              </form>
            </div>
          </section>
        </main>

        <Footer year={year} />
      </div>

      <style jsx global>{`
        .mw-global-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .mw-global-base {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(
              120% 80% at 20% 10%,
              rgba(0, 0, 0, 0.16) 0%,
              transparent 60%
            ),
            radial-gradient(
              120% 80% at 80% 90%,
              rgba(0, 0, 0, 0.2) 0%,
              transparent 60%
            ),
            linear-gradient(180deg, rgba(4, 18, 16, 0.9), rgba(4, 18, 16, 0.92));
        }
        .streak-wrap {
          position: absolute;
          width: 220%;
          height: 2px;
          transform: rotate(-12deg);
        }
        .streak {
          position: absolute;
          left: 0;
          top: 0;
          width: 220%;
          height: 100%;
          will-change: transform, opacity;
          filter: blur(0.5px);
        }
        @keyframes slide-fwd {
          0% {
            transform: translateX(-30%);
            opacity: 0;
          }
          10% {
            opacity: 0.9;
          }
          100% {
            transform: translateX(130%);
            opacity: 0;
          }
        }
        @keyframes slide-rev {
          0% {
            transform: translateX(130%);
            opacity: 0;
          }
          10% {
            opacity: 0.9;
          }
          100% {
            transform: translateX(-30%);
            opacity: 0;
          }
        }
        .streak.dir-fwd {
          animation: slide-fwd 11s linear infinite;
        }
        .streak.dir-rev {
          animation: slide-rev 11s linear infinite;
        }
        .streak-cool {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(12, 224, 178, 0.95),
            transparent
          );
          animation: slide-fwd 12s linear infinite;
        }
        .streak-warm {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 122, 26, 0.95),
            transparent
          );
          animation: slide-rev 11s linear infinite;
        }
        .streak-lime {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(163, 255, 18, 0.85),
            transparent
          );
          animation: slide-fwd 13s linear infinite;
        }
        .logo-glow {
          filter: drop-shadow(0 0 18px rgba(12, 224, 178, 0.12));
        }
        @media (prefers-reduced-motion: reduce) {
          .streak {
            animation: none !important;
            opacity: 0.35;
          }
        }
      `}</style>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  const { sanityReadClient } = await import("../../lib/sanityClient");

  const perfilSettingsQuery = /* groq */ `
    *[
      _type in ["homeSettings", "sitePageSettings", "pageSettings"] &&
      pageKey == "perfil"
    ][0]{
      "heroImageUrl": coalesce(heroImageUrl, "")
    }
  `;

  const perfilSettingsRaw = await sanityReadClient
    .fetch(perfilSettingsQuery)
    .catch(() => null);

  const initialPageSettings: PerfilPageSettings = {
    heroImageUrl: String(perfilSettingsRaw?.heroImageUrl || "").trim(),
  };

  return {
    props: {
      ...(await serverSideTranslations(
        locale ?? "es",
        ["home"],
        nextI18NextConfig,
      )),
      year: new Date().getFullYear(),
      initialPageSettings,
    },
  };
};
