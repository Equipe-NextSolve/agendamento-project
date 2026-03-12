import Link from "next/link";
import { ContentConteiner } from "@/components/ContentConteiner";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <ContentConteiner
      subtitle="Fluxo completo de frontend para clientes, prestadores e administracao."
      title="Sistema de Agendamento para Petshop"
    >
      <div className="flex w-full flex-col gap-4 lg:flex-row">
        <Card className="lg:flex-1">
          <h2 className="text-lg font-semibold">Cliente</h2>
          <p className="text-sm text-bluelight">
            Visualiza servicos, consulta horarios disponiveis e acompanha seus
            agendamentos.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              className="text-sm font-semibold text-greendark"
              href="/cadastro"
            >
              Criar conta
            </Link>
            <Link
              className="text-sm font-semibold text-greendark"
              href="/servicos"
            >
              Ver servicos
            </Link>
            <Link
              className="text-sm font-semibold text-greendark"
              href="/meus-agendamentos"
            >
              Meus agendamentos
            </Link>
          </div>
        </Card>

        <Card className="lg:flex-1">
          <h2 className="text-lg font-semibold">Prestador</h2>
          <p className="text-sm text-bluelight">
            Gerencia catalogo de servicos, disponibilidade semanal e agenda do
            dia.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              className="text-sm font-semibold text-greendark"
              href="/dashboard-prestador"
            >
              Abrir dashboard
            </Link>
            <Link
              className="text-sm font-semibold text-greendark"
              href="/login"
            >
              Fazer login
            </Link>
          </div>
        </Card>
      </div>
    </ContentConteiner>
  );
}
