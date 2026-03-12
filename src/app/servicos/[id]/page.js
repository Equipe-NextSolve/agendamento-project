import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentConteiner } from "@/components/ContentConteiner";
import { Card } from "@/components/ui/card";
import { serviceList } from "@/mock-data";

export default async function DetalheServicoPrestador({ params }) {
  const { id } = await params;
  const service = serviceList.find((item) => item.id === id);

  if (!service) {
    notFound();
  }

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
            Duracao: {service.duration}
          </span>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">Horarios sugeridos</h3>
        <div className="flex w-full flex-wrap gap-3">
          {service.slots.map((slot) => (
            <span
              className="inline-flex h-10 min-w-20 items-center justify-center rounded-lg border border-greendark text-sm font-semibold text-greendark"
              key={slot}
            >
              {slot}
            </span>
          ))}
        </div>
        <Link
          className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-greendark text-sm font-semibold text-white md:w-60"
          href="/agendamento"
        >
          Agendar este servico
        </Link>
      </Card>
    </ContentConteiner>
  );
}
