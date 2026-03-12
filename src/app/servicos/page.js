import Link from "next/link";
import { ContentConteiner } from "@/components/ContentConteiner";
import { Card } from "@/components/ui/card";
import { serviceList } from "@/mock-data";

export default function ListagemServicos() {
  return (
    <ContentConteiner
      subtitle="Catalogo de servicos e prestadores disponiveis."
      title="Servicos"
    >
      <Card>
        <div className="flex w-full flex-col gap-3 md:flex-row">
          <label className="flex flex-1 flex-col gap-2">
            <span className="text-sm font-medium">Buscar servico</span>
            <input
              className="h-11 w-full rounded-lg border border-bluelight/30 bg-white text-sm text-bluedark outline-none focus:border-greendark"
              placeholder="Digite o servico"
              type="text"
            />
          </label>
          <label className="flex flex-1 flex-col gap-2">
            <span className="text-sm font-medium">Filtrar por prestador</span>
            <select className="h-11 w-full rounded-lg border border-bluelight/30 bg-white text-sm text-bluedark outline-none focus:border-greendark">
              <option>Todos</option>
              {serviceList.map((service) => (
                <option key={service.id}>{service.provider}</option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      <div className="flex w-full flex-col gap-4">
        {serviceList.map((service) => (
          <Card key={service.id}>
            <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center">
              <div className="flex flex-1 flex-col gap-1">
                <h2 className="text-lg font-semibold">{service.name}</h2>
                <p className="text-sm text-bluelight">{service.provider}</p>
                <p className="text-sm text-bluedark">{service.description}</p>
                <span className="text-sm font-semibold text-greendark">
                  Duracao: {service.duration}
                </span>
              </div>
              <Link
                className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-greendark text-sm font-semibold text-white lg:w-44"
                href={`/servicos/${service.id}`}
              >
                Ver detalhes
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </ContentConteiner>
  );
}
