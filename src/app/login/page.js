"use client";

import { ContentConteiner } from "@/components/ContentConteiner";
import LoginForm from "@/components/forms/LoginForm";
import { Card } from "@/components/ui/card";

export default function Login() {
  return (
    <ContentConteiner
      subtitle="Autenticacao para clientes e prestadores."
      title="Login"
    >
      <Card className="">
        <LoginForm />
      </Card>
    </ContentConteiner>
  );
}
