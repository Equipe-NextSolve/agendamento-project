"use client";
import { useState } from "react";
import Link from "next/link";
import { ContentConteiner } from "@/components/ContentConteiner";
import { Card } from "@/components/ui/card";
import { FormField, fieldClassName } from "@/components/ui/form-field";
import { PrimaryButton } from "@/components/ui/primary-button";
import { cadastrarUsuario } from "@/lib/authService";

export default function Cadastro() {

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [perfil, setPerfil] = useState("");

  const handleCadastro = async(e) => {
    e.preventDefault();

    if (!perfil) {
      alert("Por Favor, selecione se você é cliente ou prestador.");
      return;
    }
  
  const resultado = await cadastrarUsuario(nome, email, senha, perfil);
  
  if(resultado.sucesso) {
    alert("Conta criada com sucesso.");
    setNome("");
    setEmail("");
    setSenha("");
    setPerfil("");
  } else {
    alert("Erro ao criar a conta: " + resultado.erro);
  }
};

  return (
    <ContentConteiner
      subtitle="Cadastro de conta para cliente ou prestador."
      title="Criar conta"
    >
      <Card className="">
        <form onSubmit={handleCadastro} className="flex w-full flex-col gap-4">
          <FormField htmlFor="name" label="Nome completo">
            <input
              className={fieldClassName()}
              id="name"
              name="name"
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </FormField>

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
              minLength="6"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </FormField>

          <FormField htmlFor="profile" label="Perfil">
            <select
              className={fieldClassName()}
              id="profile"
              name="profile"
              required
              value={perfil}
              onChange={(e) => setPerfil(e.target.value)}
            >
              <option disabled value="">
                Selecione o perfil
              </option>
              <option value="cliente">Cliente</option>
              <option value="prestador">Prestador</option>
            </select>
          </FormField>

          <PrimaryButton type="submit">Cadastrar</PrimaryButton>
        </form>

        <div className="flex w-full flex-wrap gap-2 text-sm">
          <span className="text-bluelight">Já possui conta?</span>
          <Link className="font-semibold text-greendark" href="/login">
            Entrar
          </Link>
        </div>
      </Card>
    </ContentConteiner>
  );
}
