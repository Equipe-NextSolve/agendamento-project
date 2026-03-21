"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FormField, fieldClassName } from "@/components/ui/form-field";
import { PrimaryButton } from "@/components/ui/primary-button";
import { normalizeAvailability, WEEK_DAYS } from "@/lib/availability";
import { atualizarServico, criarServico } from "@/lib/dbService";
import { auth } from "@/lib/firebase";
import { providerServiceSchema } from "@/lib/formSchemas";

const initialValues = {
  nome: "",
  duracao: "",
  descricao: "",
  disponibilidade: normalizeAvailability(),
};

function FieldError({ message }) {
  if (!message) {
    return null;
  }

  return <span className="text-sm text-red-600">{message}</span>;
}

export default function ProviderServiceForm({
  initialData,
  onCancel,
  onSuccess,
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = Boolean(initialData?.id);

  useEffect(() => {
    if (!initialData) {
      setValues(initialValues);
      setErrors({});
      return;
    }

    setValues({
      nome: initialData.name || "",
      duracao: initialData.duration || "",
      descricao: initialData.description || "",
      disponibilidade: normalizeAvailability(initialData.availability),
    });
    setErrors({});
  }, [initialData]);

  const handleChange = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleAvailabilityChange = (day, field, value) => {
    setValues((current) => ({
      ...current,
      disponibilidade: current.disponibilidade.map((item) =>
        item.day === day ? { ...item, [field]: value } : item,
      ),
    }));
    setErrors((current) => ({ ...current, disponibilidade: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const parsed = providerServiceSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors);
      toast.error("Corrija os campos destacados para continuar.");
      return;
    }

    const usuarioLogado = auth.currentUser;
    if (!usuarioLogado) {
      toast.error("Sua sessao expirou. Faca login novamente.");
      return;
    }

    setIsSubmitting(true);

    const resultado = isEditing
      ? await atualizarServico(
          initialData.id,
          usuarioLogado.uid,
          parsed.data.nome,
          parsed.data.duracao,
          parsed.data.descricao,
          parsed.data.disponibilidade,
        )
      : await criarServico(
          usuarioLogado.uid,
          parsed.data.nome,
          parsed.data.duracao,
          parsed.data.descricao,
          parsed.data.disponibilidade,
        );

    setIsSubmitting(false);

    if (resultado.sucesso) {
      toast.success(
        isEditing
          ? "Servico atualizado com sucesso."
          : "Servico publicado com sucesso.",
      );
      setValues(initialValues);
      setErrors({});
      onSuccess?.();
      return;
    }

    toast.error(
      isEditing
        ? `Erro ao atualizar: ${resultado.erro}`
        : `Erro ao publicar: ${resultado.erro}`,
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <FormField htmlFor="service-name" label="Nome do servico">
        <input
          className={fieldClassName()}
          id="service-name"
          type="text"
          value={values.nome}
          onChange={(event) => handleChange("nome", event.target.value)}
        />
        <FieldError message={errors.nome?.[0]} />
      </FormField>

      <FormField htmlFor="service-duration" label="Duracao">
        <input
          className={fieldClassName()}
          id="service-duration"
          type="text"
          value={values.duracao}
          onChange={(event) => handleChange("duracao", event.target.value)}
        />
        <FieldError message={errors.duracao?.[0]} />
      </FormField>

      <FormField htmlFor="service-description" label="Descricao">
        <textarea
          className="w-full rounded-lg border border-bluelight/30 bg-white text-sm text-bluedark outline-none focus:border-greendark"
          id="service-description"
          rows={4}
          value={values.descricao}
          onChange={(event) => handleChange("descricao", event.target.value)}
        />
        <FieldError message={errors.descricao?.[0]} />
      </FormField>

      <div className="flex w-full flex-col gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-bluedark">
            Disponibilidade semanal
          </span>
          <span className="text-sm text-bluelight">
            Configure os dias e horarios em que este servico fica disponivel.
          </span>
        </div>

        <div className="flex w-full flex-col gap-3">
          {WEEK_DAYS.map((day) => {
            const currentDay =
              values.disponibilidade.find((item) => item.day === day.key) ||
              null;

            return (
              <div
                className="grid gap-3 rounded-lg border border-bluelight/20 p-3 md:grid-cols-[1.4fr_1fr_1fr]"
                key={day.key}
              >
                <label className="flex items-center gap-3 text-sm font-medium text-bluedark">
                  <input
                    checked={Boolean(currentDay?.enabled)}
                    type="checkbox"
                    onChange={(event) =>
                      handleAvailabilityChange(
                        day.key,
                        "enabled",
                        event.target.checked,
                      )
                    }
                  />
                  {day.label}
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm text-bluelight">Inicio</span>
                  <input
                    className={fieldClassName()}
                    disabled={!currentDay?.enabled}
                    type="time"
                    value={currentDay?.start || "09:00"}
                    onChange={(event) =>
                      handleAvailabilityChange(
                        day.key,
                        "start",
                        event.target.value,
                      )
                    }
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm text-bluelight">Fim</span>
                  <input
                    className={fieldClassName()}
                    disabled={!currentDay?.enabled}
                    type="time"
                    value={currentDay?.end || "18:00"}
                    onChange={(event) =>
                      handleAvailabilityChange(
                        day.key,
                        "end",
                        event.target.value,
                      )
                    }
                  />
                </label>
              </div>
            );
          })}
        </div>

        <FieldError message={errors.disponibilidade?.[0]} />
      </div>

      <div className="flex w-full flex-col gap-3 md:flex-row">
        <PrimaryButton disabled={isSubmitting} type="submit">
          {isSubmitting
            ? "Salvando..."
            : isEditing
              ? "Atualizar servico"
              : "Salvar servico"}
        </PrimaryButton>

        {isEditing ? (
          <button
            className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-bluelight/30 text-sm font-semibold text-bluedark transition hover:border-greendark hover:text-greendark"
            type="button"
            onClick={() => {
              setValues(initialValues);
              setErrors({});
              onCancel?.();
            }}
          >
            Cancelar edicao
          </button>
        ) : null}
      </div>
    </form>
  );
}
