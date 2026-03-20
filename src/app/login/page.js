"use client";
import { useState } from "react";
import Link from "next/link";
import { ContentConteiner } from "@/components/ContentConteiner";
import { Card } from "@/components/ui/card";
import { FormField, fieldClassName } from "@/components/ui/form-field";
import { PrimaryButton } from "@/components/ui/primary-button";

import { loginUsuario } from "@/lib/authService";

export default function Login() {

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    const resultado = await loginUsuario(email, senha);

    if (resultado.sucesso) {
      alert("Login realizado com sucesso");
    } else {
      alert(resultado.erro);
    }
};

  return (
    <ContentConteiner
      subtitle="Autenticacao para clientes e prestadores."
      title="Login"
    >
      <Card className="">
        <form onSubmit={handleLogin} className="flex w-full flex-col gap-4">
          <FormField htmlFor="email" label="E-mail">
            <input
              className={fieldClassName()}
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormField>

          <FormField htmlFor="password" label="Senha">
            <input
              className={fieldClassName()}
              id="password"
              name="password"
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </FormField>

          <PrimaryButton type="submit">Entrar</PrimaryButton>
        </form>

        <div className="flex w-full flex-wrap gap-2 text-sm">
          <span className="text-bluelight">Nao possui conta?</span>
          <Link className="font-semibold text-greendark" href="/cadastro">
            Cadastrar
          </Link>
        </div>
      </Card>
    </ContentConteiner>
  );
}
