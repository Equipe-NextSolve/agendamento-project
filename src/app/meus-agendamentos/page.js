"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ContentConteiner } from "@/components/ContentConteiner";
import { RoleGuard } from "@/components/RoleGuard";
import { Card } from "@/components/ui/card";
import { ConfirmActionButton } from "@/components/ui/confirm-action-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  atualizarStatusAgendamentoPrestador,
  cancelarAgendamentoCliente,
  listarAgendamentosPorUsuario,
} from "@/lib/firebase/firestore/agendamentos";

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
  const [statusDrafts, setStatusDrafts] = useState({});
  const [updatingAppointmentId, setUpdatingAppointmentId] = useState("");
  const [cancelingAppointmentId, setCancelingAppointmentId] = useState("");
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
      setStatusDrafts({});
      setIsLoadingAppointments(false);
    };

    carregarAgendamentos();

    return () => {
      isMounted = false;
    };
  }, [loading, user]);

  const reloadAppointments = async () => {
    if (!user?.id || !copyByRole[user.perfil]) {
      return;
    }

    setIsLoadingAppointments(true);
    setError("");

    const resultado = await listarAgendamentosPorUsuario(user.id, user.perfil);

    if (!resultado.sucesso) {
      setAppointments([]);
      setError(resultado.erro || "Nao foi possivel carregar os agendamentos.");
      setIsLoadingAppointments(false);
      return;
    }

    setAppointments(resultado.agendamentos);
    setStatusDrafts({});
    setIsLoadingAppointments(false);
  };

  const handleStatusDraftChange = (appointmentId, status) => {
    setStatusDrafts((current) => ({
      ...current,
      [appointmentId]: status,
    }));
  };

  const handleStatusSave = async (appointmentId, currentStatus) => {
    if (!user?.id) {
      toast.error("Sua sessao expirou. Faca login novamente.");
      return;
    }

    const nextStatus = statusDrafts[appointmentId] || currentStatus;

    if (nextStatus === currentStatus) {
      return;
    }

    setUpdatingAppointmentId(appointmentId);

    const resultado = await atualizarStatusAgendamentoPrestador(
      appointmentId,
      user.id,
      nextStatus,
    );

    setUpdatingAppointmentId("");

    if (!resultado.sucesso) {
      toast.error(`Erro ao atualizar status: ${resultado.erro}`);
      return;
    }

    toast.success("Status do agendamento atualizado.");
    reloadAppointments();
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!user?.id) {
      toast.error("Sua sessao expirou. Faca login novamente.");
      return;
    }

    setCancelingAppointmentId(appointmentId);

    const resultado = await cancelarAgendamentoCliente(appointmentId, user.id);

    setCancelingAppointmentId("");

    if (!resultado.sucesso) {
      toast.error(`Erro ao cancelar agendamento: ${resultado.erro}`);
      return;
    }

    toast.success("Agendamento cancelado com sucesso.");
    reloadAppointments();
  };

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
  const isProviderView = user.perfil === "prestador";

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

            {isProviderView
              ? <div className="flex w-full flex-col gap-2 md:w-52">
                  <StatusBadge value={appointment.status} />
                  <select
                    className="h-10 w-full rounded-lg border border-bluelight/30 bg-white p-2 text-sm text-bluedark outline-none focus:border-greendark"
                    disabled={updatingAppointmentId === appointment.id}
                    value={statusDrafts[appointment.id] || appointment.status}
                    onChange={(event) =>
                      handleStatusDraftChange(
                        appointment.id,
                        event.target.value,
                      )
                    }
                  >
                    <option value="confirmado">confirmado</option>
                    <option value="pendente">pendente</option>
                    <option value="concluido">concluido</option>
                    <option value="cancelado">cancelado</option>
                  </select>
                  <button
                    className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border border-greendark px-4 text-sm font-semibold text-greendark transition hover:scale-[1.01] hover:bg-greendark hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={
                      updatingAppointmentId === appointment.id ||
                      (statusDrafts[appointment.id] || appointment.status) ===
                        appointment.status
                    }
                    type="button"
                    onClick={() =>
                      handleStatusSave(appointment.id, appointment.status)
                    }
                  >
                    {updatingAppointmentId === appointment.id
                      ? "Salvando..."
                      : "Salvar status"}
                  </button>
                </div>
              : <div className="flex w-full flex-col gap-2 md:w-52">
                  <StatusBadge value={appointment.status} />
                  {["confirmado", "pendente"].includes(appointment.status)
                    ? <ConfirmActionButton
                        confirmLabel="Cancelar agendamento"
                        description="Essa acao vai desmarcar o horario e liberar a agenda do prestador."
                        disabled={cancelingAppointmentId === appointment.id}
                        isProcessing={cancelingAppointmentId === appointment.id}
                        onConfirm={() =>
                          handleCancelAppointment(appointment.id)
                        }
                        title="Cancelar agendamento?"
                        tone="danger"
                        triggerLabel="Cancelar"
                      />
                    : null}
                </div>}
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
