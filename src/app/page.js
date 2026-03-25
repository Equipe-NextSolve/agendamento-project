import { ContentConteiner } from "@/components/ContentConteiner";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <ContentConteiner
      subtitle="Fluxo completo para clientes e prestadores."
      title="Sistema de Agendamento para Petshop"
    >
      <div className="flex w-full flex-col gap-4 lg:flex-row">
        <Card className="lg:flex-1">
          <h2 className="text-xl font-semibold">Cliente</h2>
          <p className="text-base text-bluelight">
            Visualiza serviços, consulta horarios disponiveis e acompanha seus
            agendamentos.
          </p>
        </Card>

        <Card className="lg:flex-1">
          <h2 className="text-xl font-semibold">Prestador</h2>
          <p className="text-base text-bluelight">
            Gerencia catalogo de serviços, disponibilidade semanal e agenda do
            dia.
          </p>
        </Card>
      </div>
    </ContentConteiner>
  );
}
