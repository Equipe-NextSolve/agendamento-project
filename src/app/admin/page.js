import { ContentConteiner } from "@/components/ContentConteiner";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { customerAppointments, providerAgenda } from "@/mock-data";

const adminRows = [...providerAgenda, ...customerAppointments];

export default function AdminPage() {
  return (
    <ContentConteiner
      subtitle="Painel administrativo para visualizacao geral dos agendamentos."
      title="Dashboard admin"
    >
      <Card>
        <div className="flex w-full flex-col gap-3 md:flex-row">
          <label className="flex flex-1 flex-col gap-2">
            <span className="text-sm font-medium">Filtro por status</span>
            <select className="h-11 w-full rounded-lg border border-bluelight/30 bg-white text-sm text-bluedark outline-none focus:border-greendark">
              <option>Todos</option>
              <option>confirmado</option>
              <option>pendente</option>
              <option>concluido</option>
            </select>
          </label>
          <label className="flex flex-1 flex-col gap-2">
            <span className="text-sm font-medium">Filtro por data</span>
            <input
              className="h-11 w-full rounded-lg border border-bluelight/30 bg-white text-sm text-bluedark outline-none focus:border-greendark"
              type="date"
            />
          </label>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">Agendamentos gerais</h2>
        <div className="flex w-full flex-col gap-3">
          {adminRows.map((item) => (
            <div
              className="flex w-full flex-col gap-3 p-3 rounded-lg border border-bluelight/20 md:flex-row md:items-center"
              key={item.id}
            >
              <div className="flex flex-1 flex-col gap-1">
                <strong className="text-sm">{item.service}</strong>
                <span className="text-sm text-bluelight">
                  {item.provider ?? item.customer}
                </span>
                <span className="text-sm text-bluedark">
                  {item.date} as {item.time}
                </span>
                <span className="text-xs text-bluelight">
                  Codigo: {item.id}
                </span>
              </div>
              <StatusBadge value={item.status} />
            </div>
          ))}
        </div>
      </Card>
    </ContentConteiner>
  );
}
