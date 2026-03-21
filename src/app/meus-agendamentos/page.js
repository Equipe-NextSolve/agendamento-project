"use client";

import { useEffect, useState } from "react";
import { ContentConteiner } from "@/components/ContentConteiner";
import { RoleGuard } from "@/components/RoleGuard";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { listarAgendamentosPorUsuario } from "@/lib/dbService";

const copyByRole = {
  cliente: {
    subtitle: "Area do cliente para acompanhar agendamentos realizados.",
    title: "Meus agendamentos",
    counterpartLabel: "Prestador",
    empty: "Voce ainda nao possui agendamentos cadastrados.",
  },
  prestador: {
    subtitle: "Area do prestador para acompanhar a propria agenda.",
    title: "Minha agenda",
    counterpartLabel: "Cliente",
    empty: "Nenhum agendamento foi encontrado para este prestador.",
  },
};

function AppointmentList() {
  const { user, loading } = useCurrentUser();
  const [appointments, setAppointments] = useState([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user?.id || !copyByRole[user.perfil]) {
      setAppointments([]);
      setIsLoadingAppointments(false);
      return;
    }

    let isMounted = true;

    const carregarAgendamentos = async () => {
      setIsLoadingAppointments(true);
      setError("");

      const resultado = await listarAgendamentosPorUsuario(
        user.id,
        user.perfil,
      );

      if (!isMounted) {
        return;
      }

      if (!resultado.sucesso) {
        setAppointments([]);
        setError(
          resultado.erro || "Nao foi possivel carregar os agendamentos.",
        );
        setIsLoadingAppointments(false);
        return;
      }

      setAppointments(resultado.agendamentos);
      setIsLoadingAppointments(false);
    };

    carregarAgendamentos();

    return () => {
      isMounted = false;
    };
  }, [loading, user]);

  if (loading || isLoadingAppointments) {
    return (
      <Card>
        <p className="text-sm text-bluelight">Carregando agendamentos...</p>
      </Card>
    );
  }

  if (!user || !copyByRole[user.perfil]) {
    return (
      <Card>
        <p className="text-sm text-bluelight">
          Seu perfil nao possui acesso a esta area.
        </p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <p className="text-sm text-red-600">{error}</p>
      </Card>
    );
  }

  if (!appointments.length) {
    return (
      <Card>
        <p className="text-sm text-bluelight">
          {copyByRole[user.perfil].empty}
        </p>
      </Card>
    );
  }

  const counterpartField =
    user.perfil === "prestador" ? "customer" : "provider";

  return (
    <div className="flex w-full flex-col gap-4">
      {appointments.map((appointment) => (
        <Card key={appointment.id}>
          <div className="flex w-full flex-col gap-3 md:flex-row md:items-center">
            <div className="flex flex-1 flex-col gap-1">
              <h2 className="text-lg font-semibold">{appointment.service}</h2>
              <span className="text-sm text-bluelight">
                {copyByRole[user.perfil].counterpartLabel}:{" "}
                {appointment[counterpartField]}
              </span>
              <span className="text-sm text-bluedark">
                {appointment.date} as {appointment.time}
              </span>
              <span className="text-xs text-bluelight">
                Codigo: {appointment.id}
              </span>
            </div>
            <StatusBadge value={appointment.status} />
          </div>
        </Card>
      ))}
    </div>
  );
}

export default function MeusAgendamentos() {
  const { user } = useCurrentUser();
  const copy = copyByRole[user?.perfil] || copyByRole.cliente;

  return (
    <ContentConteiner subtitle={copy.subtitle} title={copy.title}>
      <RoleGuard
        allowedRoles={["cliente", "prestador"]}
        unauthorizedMessage="A area de agendamentos esta disponivel apenas para clientes e prestadores."
      >
        <AppointmentList />
      </RoleGuard>
    </ContentConteiner>
  );
}
