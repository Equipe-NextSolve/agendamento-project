"use client";

import { useEffect, useState } from "react";
import { ContentConteiner } from "@/components/ContentConteiner";
import { RoleGuard } from "@/components/RoleGuard";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { listarTodosAgendamentos } from "@/lib/firebase/firestore/agendamentos";

export default function AdminPage() {
  const [status, setStatus] = useState("Todos");
  const [date, setDate] = useState("");
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const carregarAgendamentos = async () => {
      setIsLoading(true);
      setError("");

      const resultado = await listarTodosAgendamentos({ status, date });

      if (!isMounted) {
        return;
      }

      if (!resultado.sucesso) {
        setRows([]);
        setError(
          resultado.erro || "Nao foi possivel carregar os agendamentos.",
        );
        setIsLoading(false);
        return;
      }

      setRows(resultado.agendamentos);
      setIsLoading(false);
    };

    carregarAgendamentos();

    return () => {
      isMounted = false;
    };
  }, [date, status]);

  return (
    <ContentConteiner
      subtitle="Painel administrativo para visualizacao geral dos agendamentos."
      title="Dashboard admin"
    >
      <RoleGuard
        allowedRoles={["admin"]}
        unauthorizedMessage="A tela administrativa so pode ser acessada pela conta de administrador."
      >
        <Card>
          <div className="flex w-full flex-col gap-3 md:flex-row">
            <label className="flex flex-1 flex-col gap-2">
              <span className="text-sm font-medium">Filtro por status</span>
              <select
                className="h-11 w-full rounded-lg border border-bluelight/30 bg-white text-sm text-bluedark outline-none focus:border-greendark"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option>Todos</option>
                <option>confirmado</option>
                <option>pendente</option>
                <option>concluido</option>
              </select>
            </label>
            <label className="flex flex-1 flex-col gap-2">
              <span className="text-sm font-medium">Filtro por data</span>
              <input
                className="h-11 w-full rounded-lg border border-bluelight/30 bg-white text-sm text-bluedark outline-none focus:border-greendark"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </label>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Agendamentos gerais</h2>

          {isLoading
            ? <p className="text-sm text-bluelight">
                Carregando agendamentos...
              </p>
            : error
              ? <p className="text-sm text-red-600">{error}</p>
              : !rows.length
                ? <p className="text-sm text-bluelight">
                    Nenhum agendamento encontrado com os filtros aplicados.
                  </p>
                : <div className="flex w-full flex-col gap-3">
                    {rows.map((item) => (
                      <div
                        className="flex w-full flex-col gap-3 rounded-lg border border-bluelight/20 p-3 md:flex-row md:items-center"
                        key={item.id}
                      >
                        <div className="flex flex-1 flex-col gap-1">
                          <strong className="text-sm">{item.service}</strong>
                          <span className="text-sm text-bluelight">
                            Prestador: {item.provider}
                          </span>
                          <span className="text-sm text-bluedark">
                            Cliente: {item.customer}
                          </span>
                          <span className="text-sm text-bluedark">
                            {item.date} as {item.time}
                          </span>
                          <span className="text-xs text-bluelight">
                            Codigo: {item.id}
                          </span>
                        </div>
                        <StatusBadge value={item.status} />
                      </div>
                    ))}
                  </div>}
        </Card>
      </RoleGuard>
    </ContentConteiner>
  );
}
