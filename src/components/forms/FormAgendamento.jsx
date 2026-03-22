"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { FormField, fieldClassName } from "@/components/ui/form-field";
import { PrimaryButton } from "@/components/ui/primary-button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  addMinutesToTime,
  doesTimeRangeFitAvailability,
  getAvailabilityForDate,
  isDateAvailable,
} from "@/lib/availability";
import { criarAgendamento } from "@/lib/firebase/firestore/agendamentos";
import { listarServicosAtivos } from "@/lib/firebase/firestore/services";
import { agendamentoSchema } from "@/lib/formSchemas";

const initialValues = {
  serviceId: "",
  date: "",
  time: "",
  pet: "",
  notes: "",
};

function FieldError({ message }) {
  if (!message) {
    return null;
  }

  return <span className="text-sm text-red-600">{message}</span>;
}

export default function FormAgendamento() {
  const searchParams = useSearchParams();
  const serviceIdFromQuery = searchParams.get("serviceId") || "";
  const { user, loading } = useCurrentUser();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [services, setServices] = useState([]);
  const [servicesError, setServicesError] = useState("");
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const carregarServicos = async () => {
      setIsLoadingServices(true);
      setServicesError("");

      const resultado = await listarServicosAtivos();

      if (!isMounted) {
        return;
      }

      if (!resultado.sucesso) {
        setServices([]);
        setServicesError(
          resultado.erro || "Nao foi possivel carregar os servicos.",
        );
        setIsLoadingServices(false);
        return;
      }

      setServices(resultado.servicos);
      setIsLoadingServices(false);
    };

    carregarServicos();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!serviceIdFromQuery) {
      return;
    }

    setValues((current) => ({ ...current, serviceId: serviceIdFromQuery }));
  }, [serviceIdFromQuery]);

  const selectedService = useMemo(
    () => services.find((service) => service.id === values.serviceId) || null,
    [services, values.serviceId],
  );

  const selectedDayAvailability = useMemo(
    () => getAvailabilityForDate(selectedService?.availability, values.date),
    [selectedService?.availability, values.date],
  );
  const appointmentEndTime = useMemo(() => {
    if (!selectedService?.duration || !values.time) {
      return "";
    }

    return addMinutesToTime(values.time, selectedService.duration);
  }, [selectedService?.duration, values.time]);

  const handleChange = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) {
      toast.error("Aguarde a validacao da sua sessao.");
      return;
    }

    if (!user?.id) {
      toast.error("Faca login para concluir o agendamento.");
      return;
    }

    if (!selectedService?.providerId) {
      toast.error("Selecione um servico valido.");
      return;
    }

    if (!isDateAvailable(selectedService.availability, values.date)) {
      toast.error("O prestador nao atende na data selecionada.");
      return;
    }

    const parsed = agendamentoSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors);
      toast.error("Corrija os campos destacados para continuar.");
      return;
    }

    if (
      !doesTimeRangeFitAvailability(
        selectedService.availability,
        parsed.data.date,
        parsed.data.time,
        selectedService.duration,
      )
    ) {
      toast.error(
        "Escolha um horario cujo intervalo completo caiba na disponibilidade configurada pelo prestador.",
      );
      return;
    }

    setIsSubmitting(true);

    const resultado = await criarAgendamento(
      user.id,
      selectedService.providerId,
      parsed.data.serviceId,
      parsed.data.date,
      parsed.data.time,
      parsed.data.pet,
      parsed.data.notes,
    );

    setIsSubmitting(false);

    if (!resultado.sucesso) {
      toast.error(resultado.erro || "Nao foi possivel criar o agendamento.");
      return;
    }

    toast.success("Agendamento criado com sucesso.");
    setValues(initialValues);
    setErrors({});
  };

  if (isLoadingServices) {
    return <p className="text-sm text-bluelight">Carregando servicos...</p>;
  }

  if (servicesError) {
    return <p className="text-sm text-red-600">{servicesError}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <FormField htmlFor="service" label="Servico">
        <select
          className={fieldClassName()}
          id="service"
          name="service"
          value={values.serviceId}
          onChange={(event) => handleChange("serviceId", event.target.value)}
        >
          <option disabled value="">
            Selecione um servico
          </option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} - {service.provider}
            </option>
          ))}
        </select>
        <FieldError message={errors.serviceId?.[0]} />
      </FormField>

      {selectedService ? (
        <div className="rounded-lg border border-bluelight/20 bg-white p-3">
          <p className="text-sm font-semibold text-bluedark">
            {selectedService.name}
          </p>
          <p className="text-sm text-bluelight">{selectedService.provider}</p>
          {selectedService.duration ? (
            <p className="text-sm text-bluedark">
              Duracao: {selectedService.duration} min
            </p>
          ) : null}
          {selectedService.availabilitySummary ? (
            <p className="text-sm text-bluedark">
              Disponibilidade: {selectedService.availabilitySummary}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="flex w-full flex-col gap-4 md:flex-row">
        <FormField htmlFor="date" label="Data">
          <input
            className={fieldClassName()}
            id="date"
            name="date"
            type="date"
            value={values.date}
            onChange={(event) => handleChange("date", event.target.value)}
          />
          <FieldError message={errors.date?.[0]} />
        </FormField>

        <FormField htmlFor="time" label="Horario">
          <input
            className={fieldClassName()}
            id="time"
            max={selectedDayAvailability?.end || undefined}
            min={selectedDayAvailability?.start || undefined}
            name="time"
            type="time"
            value={values.time}
            onChange={(event) => handleChange("time", event.target.value)}
          />
          <FieldError message={errors.time?.[0]} />
        </FormField>
      </div>

      {values.date && selectedService ? (
        <div className="flex flex-col gap-1 text-sm text-bluelight">
          <p>
            {selectedDayAvailability?.enabled
              ? `Horario disponivel neste dia: ${selectedDayAvailability.start} - ${selectedDayAvailability.end}`
              : "O prestador nao atende no dia selecionado."}
          </p>
          {appointmentEndTime ? (
            <p>Fim previsto do atendimento: {appointmentEndTime}</p>
          ) : null}
        </div>
      ) : null}

      <FormField htmlFor="pet" label="Nome do pet">
        <input
          className={fieldClassName()}
          id="pet"
          name="pet"
          type="text"
          value={values.pet}
          onChange={(event) => handleChange("pet", event.target.value)}
        />
        <FieldError message={errors.pet?.[0]} />
      </FormField>

      <FormField htmlFor="notes" label="Observacoes">
        <textarea
          className="w-full rounded-lg border border-bluelight/30 bg-white text-sm text-bluedark outline-none focus:border-greendark"
          id="notes"
          name="notes"
          rows={4}
          value={values.notes}
          onChange={(event) => handleChange("notes", event.target.value)}
        />
        <FieldError message={errors.notes?.[0]} />
      </FormField>

      <PrimaryButton disabled={isSubmitting} type="submit">
        {isSubmitting ? "Confirmando..." : "Confirmar agendamento"}
      </PrimaryButton>
    </form>
  );
}
