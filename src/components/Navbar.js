"use client";

import Link from "next/link";
import { useState } from "react";
import { Card } from "@/components/ui/card";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/cadastro", label: "Cadastro" },
  { href: "/login", label: "Login" },
  { href: "/servicos", label: "Servicos" },
  { href: "/agendamento", label: "Agendar" },
  { href: "/meus-agendamentos", label: "Meus agendamentos" },
  { href: "/dashboard-prestador", label: "Dashboard prestador" },
  { href: "/admin", label: "Admin" },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Card className="border-greenlight border-t-0 border-b-2 rounded-t-none shadow-inner shadow-greenlight rounded-b-2xl bg-bluedark text-white w-full">
      <div className="flex w-full items-center justify-between gap-3">
        <span className="text-lg font-semibold break-normal">Pet Scheduler</span>

        {/* Desktop */}
        <nav className="hidden lg:flex w-full justify-end flex-wrap gap-2">
          {navLinks.map((link) => (
            <Link
              className="text-sm font-medium text-white/90 transition hover:bg-greenlight hover:text-bluedark rounded-2xl px-3 py-1"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Close button */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden flex flex-col gap-1.5 p-2"
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
      </div>

      {/* Mobile */}
      {isMenuOpen && (
        <nav className="lg:hidden flex flex-col gap-3">
          <div className="h-1 w-full bg-white rounded-full mb-1" />
          {navLinks.map((link) => (
            <Link
              className="text-sm font-medium text-white/90 transition hover:bg-greenlight hover:text-bluedark rounded-2xl px-3 py-1"
              href={link.href}
              key={link.href}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </Card>
  );
}
