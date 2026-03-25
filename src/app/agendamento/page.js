import { ContentConteiner } from "@/components/ContentConteiner";
import FormAgendamento from "@/components/forms/FormAgendamento";
import { RoleGuard } from "@/components/RoleGuard";
import { Card } from "@/components/ui/card";

export default function Agendamento() {
  return (
    <ContentConteiner
      subtitle="Selecione serviço, data e horario para concluir o agendamento."
      title="Novo agendamento"
    >
      <RoleGuard
        allowedRoles={["cliente"]}
        unauthorizedMessage="A tela de agendamento e exclusiva para clientes."
      >
        <Card className="">
          <FormAgendamento />
        </Card>
      </RoleGuard>
    </ContentConteiner>
  );
}
