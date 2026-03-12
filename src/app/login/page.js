import Link from "next/link";
import { ContentConteiner } from "@/components/ContentConteiner";
import { Card } from "@/components/ui/card";
import { FormField, fieldClassName } from "@/components/ui/form-field";
import { PrimaryButton } from "@/components/ui/primary-button";

export default function Login() {
  return (
    <ContentConteiner
      subtitle="Autenticacao para clientes e prestadores."
      title="Login"
    >
      <Card className="">
        <form className="flex w-full flex-col gap-4">
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
