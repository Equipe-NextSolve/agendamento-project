"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ContentConteiner } from "@/components/ContentConteiner";
import { Card } from "@/components/ui/card";
import { getAvailabilityForDate, WEEK_DAYS } from "@/lib/availability";
import { listarHorariosOcupados } from "@/lib/firebase/firestore/agendamentos";
import { buscarServicoPorId } from "@/lib/firebase/firestore/services";

const today = new Date().toISOString().split("T")[0];

export default function DetalheServicoPrestador() {
  const params = useParams();
  const serviceId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [service, setService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(today);
  const [occupiedSlots, setOccupiedSlots] = useState([]);
  const [isLoadingService, setIsLoadingService] = useState(true);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const carregarServico = async () => {
      if (!serviceId) {
        setError("Servico nao encontrado.");
        setIsLoadingService(false);
        return;
      }

      setIsLoadingService(true);
      setError("");

      const resultado = await buscarServicoPorId(serviceId);

      if (!isMounted) {
        return;
      }

      if (!resultado.sucesso) {
        setService(null);
        setError(resultado.erro || "Nao foi possivel carregar o servico.");
        setIsLoadingService(false);
        return;
      }

      setService(resultado.servico);
      setIsLoadingService(false);
    };

    carregarServico();

    return () => {
      isMounted = false;
    };
  }, [serviceId]);

  useEffect(() => {
    let isMounted = true;

    const carregarDisponibilidade = async () => {
      if (!service?.providerId || !selectedDate) {
        setOccupiedSlots([]);
        return;
      }

      setIsLoadingAvailability(true);

      const resultado = await listarHorariosOcupados(
        service.providerId,
        selectedDate,
      );

      if (!isMounted) {
        return;
      }

      if (!resultado.sucesso) {
        setOccupiedSlots([]);
        setIsLoadingAvailability(false);
        return;
      }

      setOccupiedSlots(resultado.horarios);
      setIsLoadingAvailability(false);
    };

    carregarDisponibilidade();

    return () => {
      isMounted = false;
    };
  }, [selectedDate, service?.providerId]);

  if (isLoadingService) {
    return (
      <ContentConteiner
        subtitle="Detalhes do servico, prestador e horarios disponiveis."
        title="Carregando servico"
      >
        <Card>
          <p className="text-sm text-bluelight">Carregando servico...</p>
        </Card>
      </ContentConteiner>
    );
  }

  if (error || !service) {
    return (
      <ContentConteiner
        subtitle="Detalhes do servico, prestador e horarios disponiveis."
        title="Servico indisponivel"
      >
        <Card>
          <p className="text-sm text-red-600">
            {error || "Servico nao encontrado."}
          </p>
        </Card>
      </ContentConteiner>
    );
  }

  const selectedDayAvailability = getAvailabilityForDate(
    service.availability,
    selectedDate,
  );

  return (
    <ContentConteiner
      subtitle="Detalhes do servico, prestador e horarios disponiveis."
      title={service.name}
    >
      <Card>
        <div className="flex w-full flex-col gap-3">
          <span className="text-sm font-semibold text-greendark">
            Prestador
          </span>
          <h2 className="text-xl font-semibold">{service.provider}</h2>
          <p className="text-sm text-bluedark">{service.description}</p>
          <span className="text-sm text-bluelight">
            Duracao: {service.duration} min
          </span>
          {service.availabilitySummary
            ? <span className="text-sm text-bluedark">
                Disponibilidade: {service.availabilitySummary}
              </span>
            : null}
        </div>
      </Card>

      <Card>
        <div className="flex w-full flex-col gap-3">
          <h3 className="text-lg font-semibold">Agenda semanal do prestador</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {WEEK_DAYS.map((day) => {
              const currentDay =
                service.availability.find((item) => item.day === day.key) ||
                null;

              return (
                <div
                  className="rounded-lg border border-bluelight/20 p-3"
                  key={day.key}
                >
                  <p className="text-sm font-semibold text-bluedark">
                    {day.label}
                  </p>
                  <p className="text-sm text-bluelight">
                    {currentDay?.enabled
                      ? `${currentDay.start} - ${currentDay.end}`
                      : "Indisponivel"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex w-full flex-col gap-4">
          <h3 className="text-lg font-semibold">Consulta de disponibilidade</h3>

          <label className="flex w-full flex-col gap-2">
            <span className="text-sm font-medium">Selecionar data</span>
            <input
              className="h-11 w-full rounded-lg border border-bluelight/30 bg-white text-sm text-bluedark outline-none focus:border-greendark"
              min={today}
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
            />
          </label>

          {selectedDayAvailability?.enabled
            ? <p className="text-sm text-bluedark">
                Horario configurado para o dia: {selectedDayAvailability.start}{" "}
                - {selectedDayAvailability.end}
              </p>
            : <p className="text-sm text-red-600">
                Este prestador nao atende na data selecionada.
              </p>}

          {isLoadingAvailability
            ? <p className="text-sm text-bluelight">
                Carregando horarios reservados...
              </p>
            : occupiedSlots.length
              ? <div className="flex w-full flex-col gap-2">
                  <span className="text-sm font-medium text-bluedark">
                    Horarios ja reservados
                  </span>
                  <div className="flex w-full flex-wrap gap-3">
                    {occupiedSlots.map((slot) => (
                      <span
                        className="inline-flex h-10 min-w-20 items-center justify-center rounded-lg border border-red-500 text-sm font-semibold text-red-600"
                        key={slot}
                      >
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>
              : <p className="text-sm text-bluelight">
                  Nenhum horario reservado nesta data.
                </p>}

          <Link
            className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-greendark text-sm font-semibold text-white md:w-60"
            href={`/agendamento?serviceId=${service.id}`}
          >
            Agendar este servico
          </Link>
        </div>
      </Card>
    </ContentConteiner>
  );
}
