"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { logoutUsuario } from "@/lib/firebase/auth";

const linksByProfile = {
  admin: [
    { href: "/", label: "Home" },
    { href: "/servicos", label: "Serviços" },
    { href: "/admin", label: "Admin" },
  ],
  cliente: [
    { href: "/", label: "Home" },
    { href: "/servicos", label: "Serviços" },
    { href: "/agendamento", label: "Agendar" },
    { href: "/meus-agendamentos", label: "Meus agendamentos" },
  ],
  prestador: [
    { href: "/", label: "Home" },
    { href: "/dashboard-prestador", label: "Dashboard prestador" },
    { href: "/meus-agendamentos", label: "Minha agenda" },
  ],
  visitante: [
    { href: "/", label: "Home" },
    { href: "/cadastro", label: "Cadastro" },
    { href: "/login", label: "Login" },
  ],
};

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useCurrentUser();
  const profile = user?.perfil || "visitante";
  const navLinks = linksByProfile[profile] || linksByProfile.visitante;

  const handleLogout = async () => {
    const resultado = await logoutUsuario();

    if (!resultado.sucesso) {
      alert(resultado.erro);
      return;
    }

    setIsMenuOpen(false);
    router.replace(profile === "admin" ? "/admin/login" : "/login");
  };

  const renderLink = (link) => {
    const isActive = pathname === link.href;

    return (
      <Link
        className={`rounded-2xl px-3 py-1 text-sm font-medium transition ${
          isActive
            ? "bg-greenlight text-bluedark"
            : "text-white/90 hover:bg-greenlight hover:text-bluedark"
        }`}
        href={link.href}
        key={link.href}
        onClick={() => setIsMenuOpen(false)}
      >
        {link.label}
      </Link>
    );
  };

  return (
    <Card className="border-greenlight border-t-0 border-b-2 rounded-t-none shadow-inner shadow-greenlight rounded-b-2xl bg-bluedark text-white w-full">
      <div className="flex w-full items-center justify-between gap-3">
        <span className="text-lg font-semibold break-normal">
          Pet Scheduler
        </span>

        {/* Desktop */}
        <nav className="hidden lg:flex w-full justify-end flex-wrap gap-2">
          {navLinks.map(renderLink)}
        </nav>

        <div className="flex items-center gap-6">
          {loading
            ? <div
                className={`w-6 h-6 border-5 border-t-transparent border-white rounded-full animate-spin`}
              />
            : user
              ? <div className="sm:flex flex-col items-end">
                  <p className="text-sm font-semibold">{user.nome}</p>
                  <span className="text-xs uppercase tracking-wide text-white/70">
                    {user.perfil}
                  </span>
                </div>
              : <span className="sm:block text-sm text-white/80">
                  Visitante
                </span>}

          {/* Close button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden flex cursor-pointer flex-col gap-1.5 rounded-lg p-2 transition hover:bg-white/10"
            aria-label="Toggle menu"
          >
            <span
              className={`h-0.5 w-6 bg-white transition-all ${
                isMenuOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`h-0.5 w-6 bg-white transition-all ${
                isMenuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`h-0.5 w-6 bg-white transition-all ${
                isMenuOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </button>

          {user && (
            <div className="hidden lg:flex justify-end">
              <button
                type="button"
                onClick={handleLogout}
                className="cursor-pointer rounded-2xl px-3 py-1 text-sm font-medium text-white/90 transition hover:bg-red-400 hover:text-white"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile */}
      {isMenuOpen && (
        <nav className="lg:hidden flex flex-col gap-3">
          <div className="h-1 w-full bg-white rounded-full mb-1" />
          {navLinks.map(renderLink)}
          {user && (
            <button
              type="button"
              onClick={handleLogout}
              className="cursor-pointer rounded-2xl px-3 py-1 text-left text-sm font-medium text-white/90 transition hover:bg-red-400 hover:text-white"
            >
              Sair
            </button>
          )}
        </nav>
      )}
    </Card>
  );
}
