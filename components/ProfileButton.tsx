// components/ProfileButton.tsx
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type PlanKey = "free" | "pro" | "elite" | null;

export default function ProfileButton({ className = "" }: { className?: string }) {
  const [email, setEmail] = useState<string>("");
  const [plan, setPlan] = useState<PlanKey>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const em = localStorage.getItem("mw_user_email") || "";
    const pl = (localStorage.getItem("mw_active_plan") as PlanKey) || null;
    setEmail(em);
    setPlan(pl);
  }, []);

  const initials = useMemo(() => {
    if (!email) return "👤";
    const base = email.split("@")[0] || "";
    if (!base) return "👤";
    const parts = base.replace(/[^a-zA-Z0-9 ]/g, " ").trim().split(/\s+/);
    const letters = (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
    return letters.toUpperCase() || "👤";
  }, [email]);

  const planBadge = useMemo(() => {
    if (!plan) return null;
    const map: Record<Exclude<PlanKey, null>, string> = {
      free: "bg-white/5 border-white/20 text-gray-200",
      pro: "bg-[#0CE0B2]/12 border-[#0CE0B2]/40 text-white",
      elite: "bg-[#FF7A1A]/12 border-[#FF7A1A]/40 text-white",
    };
    const label = plan === "free" ? "FREE" : plan === "pro" ? "PRO" : "ELITE";
    return (
      <span className={`ml-2 hidden md:inline rounded-full px-2 py-0.5 text-[11px] border ${map[plan]}`}>
        {label}
      </span>
    );
  }, [plan]);

  return (
    <Link
      href="/perfil"
      className={`inline-flex items-center rounded-2xl border border-white/20 bg-black/30 backdrop-blur-md px-3 py-1.5 text-sm text-gray-100 hover:bg-white/5 ${className}`}
      aria-label="Ir a tu perfil"
    >
      <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/30 bg-black/40 text-[11px]">
        {initials}
      </span>
      <span className="hidden sm:inline">{email ? "Perfil" : "Acceder"}</span>
      {planBadge}
    </Link>
  );
}
