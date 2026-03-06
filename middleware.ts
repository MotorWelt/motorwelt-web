// middleware.ts (EN LA RAÍZ DEL PROYECTO)
import { NextRequest, NextResponse } from "next/server";

const COOKIE_ROLE = "mw_role";

function redirectToLogin(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Solo cuidar /admin/*
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  // Permitir siempre el login
  if (pathname === "/admin/login") {
    // Si ya hay sesión, no dejar entrar al login (lo mandamos a su panel)
    const role = req.cookies.get(COOKIE_ROLE)?.value;
    if (role === "admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/perfil";
      return NextResponse.redirect(url);
    }
    if (role === "editor" || role === "autor") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/perfil-equipo";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Requiere sesión para TODO lo demás en /admin
  const role = req.cookies.get(COOKIE_ROLE)?.value;
  if (!role) return redirectToLogin(req);

  // Reglas por rol (ajústalas a tu gusto)
  // Admin: acceso total
  if (role === "admin") return NextResponse.next();

  // Editor/Autor: bloquear /admin/perfil (solo admin)
  if (pathname.startsWith("/admin/perfil") && pathname !== "/admin/perfil-equipo") {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/perfil-equipo";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Matcher: aplica SOLO a /admin/* (mejor rendimiento)
export const config = {
  matcher: ["/admin/:path*"],
};
