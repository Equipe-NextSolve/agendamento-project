"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ContentConteiner } from "@/components/ContentConteiner";
import { Card } from "@/components/ui/card";
import { FormField, fieldClassName } from "@/components/ui/form-field";
import { PrimaryButton } from "@/components/ui/primary-button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { loginAdmin } from "@/lib/firebase/firestore/admin";

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, loading } = useCurrentUser();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user?.perfil === "admin") {
      router.replace("/admin");
    }
  }, [loading, router, user?.perfil]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim() || !senha.trim()) {
      toast.error("Informe email e senha do administrador.");
      return;
    }

    setIsSubmitting(true);
    const resultado = await loginAdmin(email.trim(), senha);
    setIsSubmitting(false);

    if (!resultado.sucesso) {
      toast.error(resultado.erro);
      return;
    }

    toast.success("Login administrativo realizado com sucesso.");
    router.replace("/admin");
  };

  return (
    <ContentConteiner
      subtitle="Acesso exclusivo para o painel administrativo."
      title="Login admin"
    >
      <Card className="mx-auto w-full">
        <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit}>
          <FormField htmlFor="admin-email" label="Email admin">
            <input
              className={fieldClassName()}
              id="admin-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </FormField>

          <FormField htmlFor="admin-password" label="Senha admin">
            <input
              className={fieldClassName()}
              id="admin-password"
              type="password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
            />
          </FormField>

          <PrimaryButton disabled={isSubmitting} type="submit">
            {isSubmitting ? "Entrando..." : "Entrar no admin"}
          </PrimaryButton>
        </form>
      </Card>
    </ContentConteiner>
  );
}
