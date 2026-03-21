"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { FormField, fieldClassName } from "@/components/ui/form-field";
import { PrimaryButton } from "@/components/ui/primary-button";
import { cadastrarUsuario } from "@/lib/authService";
import { cadastroSchema } from "@/lib/formSchemas";

const initialValues = {
  nome: "",
  email: "",
  senha: "",
  perfil: "",
};

function FieldError({ message }) {
  if (!message) {
    return null;
  }

  return <span className="text-sm text-red-600">{message}</span>;
}

export default function CadastroForm() {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const parsed = cadastroSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors);
      toast.error("Corrija os campos destacados para continuar.");
      return;
    }

    setIsSubmitting(true);

    const resultado = await cadastrarUsuario(
      parsed.data.nome,
      parsed.data.email,
      parsed.data.senha,
      parsed.data.perfil,
    );

    setIsSubmitting(false);

    if (resultado.sucesso) {
      toast.success("Conta criada com sucesso.");
      setValues(initialValues);
      setErrors({});
      router.push("/login");
      return;
    }

    toast.error(`Erro ao criar a conta: ${resultado.erro}`);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
        <FormField htmlFor="name" label="Nome completo">
          <input
            className={fieldClassName()}
            id="name"
            name="name"
            type="text"
            value={values.nome}
            onChange={(event) => handleChange("nome", event.target.value)}
          />
          <FieldError message={errors.nome?.[0]} />
        </FormField>

        <FormField htmlFor="email" label="E-mail">
          <input
            className={fieldClassName()}
            id="email"
            name="email"
            type="email"
            value={values.email}
            onChange={(event) => handleChange("email", event.target.value)}
          />
          <FieldError message={errors.email?.[0]} />
        </FormField>

        <FormField htmlFor="password" label="Senha">
          <input
            className={fieldClassName()}
            id="password"
            name="password"
            type="password"
            value={values.senha}
            onChange={(event) => handleChange("senha", event.target.value)}
          />
          <FieldError message={errors.senha?.[0]} />
        </FormField>

        <FormField htmlFor="profile" label="Perfil">
          <select
            className={fieldClassName()}
            id="profile"
            name="profile"
            value={values.perfil}
            onChange={(event) => handleChange("perfil", event.target.value)}
          >
            <option disabled value="">
              Selecione o perfil
            </option>
            <option value="cliente">Cliente</option>
            <option value="prestador">Prestador</option>
          </select>
          <FieldError message={errors.perfil?.[0]} />
        </FormField>

        <PrimaryButton disabled={isSubmitting} type="submit">
          {isSubmitting ? "Cadastrando..." : "Cadastrar"}
        </PrimaryButton>
      </form>

      <div className="flex w-full flex-wrap gap-2 text-sm">
        <span className="text-bluelight">Ja possui conta?</span>
        <Link className="font-semibold text-greendark" href="/login">
          Entrar
        </Link>
      </div>
    </>
  );
}
