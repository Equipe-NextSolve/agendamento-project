import { ContentConteiner } from "@/components/ContentConteiner";
import { Card } from "@/components/ui/card";
import { FormField, fieldClassName } from "@/components/ui/form-field";
import { PrimaryButton } from "@/components/ui/primary-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { providerAgenda, serviceList } from "@/mock-data";

export default function DashboardPrestador() {
  return (
    <ContentConteiner
      subtitle="Gestao de servicos, disponibilidade semanal e agenda do prestador."
      title="Dashboard do prestador"
    >
      <div className="flex w-full flex-col gap-4 lg:flex-row">
        <Card className="lg:flex-1">
          <h2 className="text-lg font-semibold">Cadastrar novo servico</h2>
          <form className="flex w-full flex-col gap-4">
            <FormField htmlFor="service-name" label="Nome do servico">
              <input
                className={fieldClassName()}
                id="service-name"
                type="text"
              />
            </FormField>

            <FormField htmlFor="service-duration" label="Duracao">
              <input
                className={fieldClassName()}
                id="service-duration"
                type="text"
              />
            </FormField>

            <FormField htmlFor="service-description" label="Descricao">
              <textarea
                className="w-full rounded-lg border border-bluelight/30 bg-white text-sm text-bluedark outline-none focus:border-greendark"
                id="service-description"
                rows={4}
              />
            </FormField>

            <FormField htmlFor="availability" label="Disponibilidade">
              <select
                className={fieldClassName()}
                defaultValue=""
                id="availability"
              >
                <option disabled value="">
                  Selecione um turno
                </option>
                <option>Seg a Sex - Manha</option>
                <option>Seg a Sex - Tarde</option>
                <option>Sabado - Manha</option>
              </select>
            </FormField>

            <PrimaryButton type="submit">Salvar servico</PrimaryButton>
          </form>
        </Card>

        <div className="flex flex-1 flex-col gap-4">
          <Card>
            <h2 className="text-lg font-semibold">Servicos publicados</h2>
            <div className="flex w-full flex-col gap-3">
              {serviceList.map((service) => (
                <div
                  className="flex w-full flex-col gap-1 p-3 rounded-lg border border-bluelight/20"
                  key={service.id}
                >
                  <strong className="text-sm">{service.name}</strong>
                  <span className="text-sm text-bluelight">
                    {service.duration}
                  </span>
                  <span className="text-sm text-bluedark">
                    {service.description}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold">Agenda de hoje</h2>
            <div className="flex w-full flex-col gap-3">
              {providerAgenda.map((item) => (
                <div
                  className="flex w-full flex-col gap-3 p-3 rounded-lg border border-bluelight/20 md:flex-row md:items-center"
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
                  </div>
                  <StatusBadge value={item.status} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </ContentConteiner>
  );
}
