"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { FormField, fieldClassName } from "@/components/ui/form-field";
import { PrimaryButton } from "@/components/ui/primary-button";
import { loginUsuario } from "@/lib/authService";
import { loginSchema } from "@/lib/formSchemas";

const initialValues = {
  email: "",
  senha: "",
};

function FieldError({ message }) {
  if (!message) {
    return null;
  }

  return <span className="text-sm text-red-600">{message}</span>;
}

export default function LoginForm() {
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

    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors);
      toast.error("Corrija os campos destacados para continuar.");
      return;
    }

    setIsSubmitting(true);
    const resultado = await loginUsuario(parsed.data.email, parsed.data.senha);
    setIsSubmitting(false);

    if (resultado.sucesso) {
      toast.success("Login realizado com sucesso.");
      setValues(initialValues);
      setErrors({});
      router.push("/");
      return;
    }

    toast.error(resultado.erro);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
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

        <PrimaryButton disabled={isSubmitting} type="submit">
          {isSubmitting ? "Entrando..." : "Entrar"}
        </PrimaryButton>
      </form>

      <div className="flex w-full flex-wrap gap-2 text-sm">
        <span className="text-bluelight">Nao possui conta?</span>
        <Link className="font-semibold text-greendark" href="/cadastro">
          Cadastrar
        </Link>
      </div>
    </>
  );
}
