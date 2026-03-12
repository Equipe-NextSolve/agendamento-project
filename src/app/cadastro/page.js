import Link from "next/link";
import { ContentConteiner } from "@/components/ContentConteiner";
import { Card } from "@/components/ui/card";
import { FormField, fieldClassName } from "@/components/ui/form-field";
import { PrimaryButton } from "@/components/ui/primary-button";

export default function Cadastro() {
  return (
    <ContentConteiner
      subtitle="Cadastro de conta para cliente ou prestador."
      title="Criar conta"
    >
      <Card className="">
        <form className="flex w-full flex-col gap-4">
          <FormField htmlFor="name" label="Nome completo">
            <input
              className={fieldClassName()}
              id="name"
              name="name"
              type="text"
            />
          </FormField>

          <FormField htmlFor="email" label="E-mail">
            <input
              className={fieldClassName()}
              id="email"
              name="email"
              type="email"
            />
          </FormField>

          <FormField htmlFor="password" label="Senha">
            <input
              className={fieldClassName()}
              id="password"
              name="password"
              type="password"
            />
          </FormField>

          <FormField htmlFor="profile" label="Perfil">
            <select
              className={fieldClassName()}
              defaultValue=""
              id="profile"
              name="profile"
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
