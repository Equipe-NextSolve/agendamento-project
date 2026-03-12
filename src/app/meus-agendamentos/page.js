import { ContentConteiner } from "@/components/ContentConteiner";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { customerAppointments } from "@/mock-data";

export default function MeusAgendamentos() {
  return (
    <ContentConteiner
      subtitle="Area do cliente para acompanhar agendamentos realizados."
      title="Meus agendamentos"
    >
      <div className="flex w-full flex-col gap-4">
        {customerAppointments.map((appointment) => (
          <Card key={appointment.id}>
            <div className="flex w-full flex-col gap-3 md:flex-row md:items-center">
              <div className="flex flex-1 flex-col gap-1">
                <h2 className="text-lg font-semibold">{appointment.service}</h2>
                <span className="text-sm text-bluelight">
                  {appointment.provider}
                </span>
                <span className="text-sm text-bluedark">
                  {appointment.date} as {appointment.time}
                </span>
                <span className="text-xs text-bluelight">
                  Codigo: {appointment.id}
                </span>
              </div>
              <StatusBadge value={appointment.status} />
            </div>
          </Card>
        ))}
      </div>
    </ContentConteiner>
  );
}
