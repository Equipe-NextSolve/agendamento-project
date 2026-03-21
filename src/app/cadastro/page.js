"use client";

import { ContentConteiner } from "@/components/ContentConteiner";
import CadastroForm from "@/components/forms/CadastroForm";
import { Card } from "@/components/ui/card";

export default function Cadastro() {
  return (
    <ContentConteiner
      subtitle="Cadastro de conta para cliente ou prestador."
      title="Criar conta"
    >
      <Card className="">
        <CadastroForm />
      </Card>
    </ContentConteiner>
  );
}
