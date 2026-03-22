"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ContentConteiner } from "@/components/ContentConteiner";
import ProviderServiceForm from "@/components/forms/ProviderServiceForm";
import { RoleGuard } from "@/components/RoleGuard";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  atualizarStatusAgendamentoPrestador,
  listarAgendaDoPrestador,
} from "@/lib/firebase/firestore/agendamentos";
import {
  deletarServico,
  listarServicosPorPrestador,
} from "@/lib/firebase/firestore/services";

const today = new Date().toISOString().split("T")[0];

function DashboardPrestadorContent() {
  const { user, loading } = useCurrentUser();
  const [services, setServices] = useState([]);
  const [agenda, setAgenda] = useState([]);
  const [editingService, setEditingService] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [deletingServiceId, setDeletingServiceId] = useState("");
  const [updatingAppointmentId, setUpdatingAppointmentId] = useState("");
  const [statusDrafts, setStatusDrafts] = useState({});
  const [error, setError] = useState("");

  const carregarDados = useCallback(async (prestadorId) => {
    if (!prestadorId) {
      setServices([]);
      setAgenda([]);
      setIsLoadingData(false);
      return;
    }

    setIsLoadingData(true);
    setError("");

    const [servicosResult, agendaResult] = await Promise.all([
      listarServicosPorPrestador(prestadorId),
      listarAgendaDoPrestador(prestadorId, today),
    ]);

    if (!servicosResult.sucesso) {
      setError(servicosResult.erro || "Nao foi possivel carregar os servicos.");
      setServices([]);
      setAgenda([]);
      setIsLoadingData(false);
      return;
    }

    if (!agendaResult.sucesso) {
      setError(agendaResult.erro || "Nao foi possivel carregar a agenda.");
      setServices(servicosResult.servicos);
      setAgenda([]);
      setIsLoadingData(false);
      return;
    }

    setServices(servicosResult.servicos);
    setAgenda(agendaResult.agenda);
    setIsLoadingData(false);
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }

    carregarDados(user?.id);
  }, [carregarDados, loading, user?.id]);

  const handleDelete = async (serviceId) => {
    if (!user?.id) {
      toast.error("Sua sessao expirou. Faca login novamente.");
      return;
    }

    setDeletingServiceId(serviceId);
    const resultado = await deletarServico(serviceId, user.id);
    setDeletingServiceId("");

    if (!resultado.sucesso) {
      toast.error(`Erro ao excluir: ${resultado.erro}`);
      return;
    }

    if (editingService?.id === serviceId) {
      setEditingService(null);
    }

    toast.success("Servico excluido com sucesso.");
    carregarDados(user.id);
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
    carregarDados(user.id);
  };

  return (
    <div className="flex w-full flex-col gap-4 lg:flex-row">
      <Card className="lg:flex-1">
        <h2 className="text-lg font-semibold">
          {editingService ? "Editar servico" : "Cadastrar novo servico"}
        </h2>
        <ProviderServiceForm
          initialData={editingService}
          onCancel={() => setEditingService(null)}
          onSuccess={() => {
            setEditingService(null);
            carregarDados(user?.id);
          }}
        />
      </Card>

      <div className="flex flex-1 flex-col gap-4">
        <Card>
          <h2 className="text-lg font-semibold">Servicos publicados</h2>

          {loading || isLoadingData
            ? <p className="text-sm text-bluelight">Carregando servicos...</p>
            : error
              ? <p className="text-sm text-red-600">{error}</p>
              : !services.length
                ? <p className="text-sm text-bluelight">
                    Nenhum servico publicado por este prestador.
                  </p>
                : <div className="flex w-full flex-col gap-3">
                    {services.map((service) => (
                      <div
                        className="flex w-full flex-col gap-3 rounded-lg border border-bluelight/20 p-3"
                        key={service.id}
                      >
                        <div className="flex w-full flex-col gap-1">
                          <strong className="text-sm">{service.name}</strong>
                          <span className="text-sm text-bluelight">
                            Duracao: {service.duration} min
                          </span>
                          <span className="text-sm text-bluedark">
                            {service.description}
                          </span>
                          {service.availabilitySummary
                            ? <span className="text-sm text-bluedark">
                                Disponibilidade: {service.availabilitySummary}
                              </span>
                            : null}
                          <span className="text-xs text-bluelight">
                            {service.active ? "Publicado" : "Inativo"}
                          </span>
                        </div>

                        <div className="flex w-full flex-col gap-2 md:flex-row">
                          <button
                            className="inline-flex h-10 items-center justify-center rounded-lg border border-greendark px-4 text-sm font-semibold text-greendark transition hover:bg-greendark hover:text-white"
                            type="button"
                            onClick={() => setEditingService(service)}
                          >
                            Editar
                          </button>
                          <button
                            className="inline-flex h-10 items-center justify-center rounded-lg border border-red-500 px-4 text-sm font-semibold text-red-600 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={deletingServiceId === service.id}
                            type="button"
                            onClick={() => handleDelete(service.id)}
                          >
                            {deletingServiceId === service.id
                              ? "Excluindo..."
                              : "Excluir"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Agenda de hoje</h2>

          {loading || isLoadingData
            ? <p className="text-sm text-bluelight">Carregando agenda...</p>
            : error
              ? <p className="text-sm text-red-600">{error}</p>
              : !agenda.length
                ? <p className="text-sm text-bluelight">
                    Nenhum agendamento encontrado para hoje.
                  </p>
                : <div className="flex w-full flex-col gap-3">
                    {agenda.map((item) => (
                      <div
                        className="flex w-full flex-col gap-3 rounded-lg border border-bluelight/20 p-3 md:flex-row md:items-center"
                        key={item.id}
                      >
                        <div className="flex flex-1 flex-col gap-1">
                          <strong className="text-sm">{item.customer}</strong>
                          <span className="text-sm text-bluelight">
                            {item.service}
                          </span>
                          <span className="text-sm text-bluedark">
                            {item.date} as {item.time}
                          </span>
                          {item.pet
                            ? <span className="text-sm text-bluedark">
                                Pet: {item.pet}
                              </span>
                            : null}
                        </div>
                        <div className="flex w-full flex-col gap-2 md:w-52">
                          <StatusBadge value={item.status} />
                          <select
                            className="h-10 w-full rounded-lg border border-bluelight/30 bg-white px-3 text-sm text-bluedark outline-none focus:border-greendark"
                            disabled={updatingAppointmentId === item.id}
                            value={statusDrafts[item.id] || item.status}
                            onChange={(event) =>
                              handleStatusDraftChange(
                                item.id,
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
                            className="inline-flex h-10 items-center justify-center rounded-lg border border-greendark px-4 text-sm font-semibold text-greendark transition hover:bg-greendark hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={
                              updatingAppointmentId === item.id ||
                              (statusDrafts[item.id] || item.status) ===
                                item.status
                            }
                            type="button"
                            onClick={() =>
                              handleStatusSave(item.id, item.status)
                            }
                          >
                            {updatingAppointmentId === item.id
                              ? "Salvando..."
                              : "Salvar status"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>}
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPrestador() {
  return (
    <ContentConteiner
      subtitle="Gestao de servicos, disponibilidade semanal e agenda do prestador."
      title="Dashboard do prestador"
    >
      <RoleGuard
        allowedRoles={["prestador"]}
        unauthorizedMessage="O dashboard do prestador e exclusivo para contas de prestador."
      >
        <DashboardPrestadorContent />
      </RoleGuard>
    </ContentConteiner>
  );
}
