"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const defaultRedirectByRole = {
  admin: "/admin",
  cliente: "/meus-agendamentos",
  prestador: "/dashboard-prestador",
};

export function RoleGuard({
  allowedRoles,
  children,
  redirectTo,
  unauthorizedMessage,
}) {
  const router = useRouter();
  const { user, loading } = useCurrentUser();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    if (!allowedRoles.includes(user.perfil)) {
      router.replace(redirectTo || defaultRedirectByRole[user.perfil] || "/");
    }
  }, [allowedRoles, loading, redirectTo, router, user]);

  if (loading) {
    return (
      <Card>
        <p className="text-sm text-bluelight">Carregando permissões...</p>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <p className="text-sm text-bluelight">
          Faça login para acessar esta área.
        </p>
      </Card>
    );
  }

  if (!allowedRoles.includes(user.perfil)) {
    return (
      <Card>
        <p className="text-sm text-bluelight">
          {unauthorizedMessage ||
            "Seu perfil não tem permissão para acessar esta página."}
        </p>
        <Link className="text-sm font-semibold text-greendark" href="/">
          Voltar para a página inicial
        </Link>
      </Card>
    );
  }

  return children;
}
