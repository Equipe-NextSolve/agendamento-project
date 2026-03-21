"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ContentConteiner } from "@/components/ContentConteiner";
import { Card } from "@/components/ui/card";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { listarServicosAtivos } from "@/lib/dbService";

export default function ListagemServicos() {
  const router = useRouter();
  const { user, loading: isLoadingUser } = useCurrentUser();
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [providerFilter, setProviderFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLoadingUser) {
      return;
    }

    if (user?.perfil === "prestador") {
      router.replace("/dashboard-prestador");
    }
  }, [isLoadingUser, router, user?.perfil]);

  useEffect(() => {
    if (isLoadingUser || user?.perfil === "prestador") {
      return;
    }

    let isMounted = true;

    const carregarServicos = async () => {
      setIsLoading(true);
      setError("");

      const resultado = await listarServicosAtivos();

      if (!isMounted) {
        return;
      }

      if (!resultado.sucesso) {
        setServices([]);
        setError(resultado.erro || "Nao foi possivel carregar os servicos.");
        setIsLoading(false);
        return;
      }

      setServices(resultado.servicos);
      setIsLoading(false);
    };

    carregarServicos();

    return () => {
      isMounted = false;
    };
  }, [isLoadingUser, user?.perfil]);

  const filteredServices = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const normalizedProvider = providerFilter.trim().toLowerCase();

    return services.filter((service) => {
      const matchesSearch =
        !normalizedSearch ||
        service.name.toLowerCase().includes(normalizedSearch) ||
        service.description.toLowerCase().includes(normalizedSearch);

      const matchesProvider =
        !normalizedProvider ||
        service.provider.toLowerCase().includes(normalizedProvider);

      return matchesSearch && matchesProvider;
    });
  }, [providerFilter, search, services]);

  if (isLoadingUser || user?.perfil === "prestador") {
    return (
      <ContentConteiner
        subtitle="Catalogo de servicos e prestadores disponiveis."
        title="Servicos"
      >
        <Card>
          <p className="text-sm text-bluelight">Carregando acesso...</p>
        </Card>
      </ContentConteiner>
    );
  }

  return (
    <ContentConteiner
      subtitle="Catalogo de servicos e prestadores disponiveis."
      title="Servicos"
    >
      <Card>
        <div className="flex w-full flex-col gap-3 md:flex-row">
          <label className="flex flex-1 flex-col gap-2">
            <span className="text-sm font-medium">Buscar servico</span>
            <input
              className="h-11 w-full rounded-lg border border-bluelight/30 bg-white text-sm text-bluedark outline-none focus:border-greendark"
              placeholder="Digite o servico"
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <label className="flex flex-1 flex-col gap-2">
            <span className="text-sm font-medium">Filtrar por prestador</span>
            <input
              className="h-11 w-full rounded-lg border border-bluelight/30 bg-white text-sm text-bluedark outline-none focus:border-greendark"
              placeholder="Digite o prestador"
              type="text"
              value={providerFilter}
              onChange={(event) => setProviderFilter(event.target.value)}
            />
          </label>
        </div>
      </Card>

      {isLoading
        ? <Card>
            <p className="text-sm text-bluelight">Carregando servicos...</p>
          </Card>
        : error
          ? <Card>
              <p className="text-sm text-red-600">{error}</p>
            </Card>
          : !filteredServices.length
            ? <Card>
                <p className="text-sm text-bluelight">
                  Nenhum servico encontrado com os filtros atuais.
                </p>
              </Card>
            : <div className="flex w-full flex-col gap-4">
                {filteredServices.map((service) => (
                  <Card key={service.id}>
                    <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center">
                      <div className="flex flex-1 flex-col gap-1">
                        <h2 className="text-lg font-semibold">
                          {service.name}
                        </h2>
                        <p className="text-sm text-bluelight">
                          {service.provider}
                        </p>
                        <p className="text-sm text-bluedark">
                          {service.description}
                        </p>
                        <span className="text-sm font-semibold text-greendark">
                          Duracao: {service.duration}
                        </span>
                        {service.availabilitySummary
                          ? <span className="text-sm text-bluedark">
                              Disponibilidade: {service.availabilitySummary}
                            </span>
                          : null}
                      </div>
                      <Link
                        className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-greendark text-sm font-semibold text-white lg:w-44"
                        href={`/servicos/${service.id}`}
                      >
                        Ver detalhes
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>}
    </ContentConteiner>
  );
}
