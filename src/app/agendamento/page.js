import { ContentConteiner } from "@/components/ContentConteiner";
import { Card } from "@/components/ui/card";
import { FormField, fieldClassName } from "@/components/ui/form-field";
import { PrimaryButton } from "@/components/ui/primary-button";
import { serviceList } from "@/mock-data";

export default function Agendamento() {
  return (
    <ContentConteiner
      subtitle="Selecione servico, data e horario para concluir o agendamento."
      title="Novo agendamento"
    >
      <Card className="">
        <form className="flex w-full flex-col gap-4">
          <FormField htmlFor="service" label="Servico">
            <select
              className={fieldClassName()}
              defaultValue=""
              id="service"
              name="service"
            >
              <option disabled value="">
                Selecione um servico
              </option>
              {serviceList.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} - {service.provider}
                </option>
              ))}
            </select>
          </FormField>

          <div className="flex w-full flex-col gap-4 md:flex-row">
            <FormField htmlFor="date" label="Data">
              <input
                className={fieldClassName()}
                id="date"
                name="date"
                type="date"
              />
            </FormField>

            <FormField htmlFor="time" label="Horario">
              <input
                className={fieldClassName()}
                id="time"
                name="time"
                type="time"
              />
            </FormField>
          </div>

          <FormField htmlFor="pet" label="Nome do pet">
            <input
              className={fieldClassName()}
              id="pet"
              name="pet"
              type="text"
            />
          </FormField>

          <FormField htmlFor="notes" label="Observacoes">
            <textarea
              className="w-full rounded-lg border border-bluelight/30 bg-white text-sm text-bluedark outline-none focus:border-greendark"
              id="notes"
              name="notes"
              rows={4}
            />
          </FormField>

          <PrimaryButton type="submit">Confirmar agendamento</PrimaryButton>
        </form>
      </Card>
    </ContentConteiner>
  );
}
