"use client";
import { useState } from "react";
import { ContentConteiner } from "@/components/ContentConteiner";
import { Card } from "@/components/ui/card";
import { FormField, fieldClassName } from "@/components/ui/form-field";
import { PrimaryButton } from "@/components/ui/primary-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { providerAgenda, serviceList } from "@/mock-data";
import { auth } from "@/lib/firebase";
import { criarServico } from "@/lib/dbService";


export default function DashboardPrestador() {
  const [nome, setNome] = useState("");
  const [duracao, setDuracao] = useState("");
  const [descricao, setDescricao] = useState("");
  const [disponibilidade, setDisponibilidade] = useState("");

  const handleCriarServico = async (e) => {
    e.preventDefault();
  

    const usuarioLogado = auth.currentUser
    if(!usuarioLogado) {
      alert("Sua sessão Expirou. Faça Login novamente.");
      return;
    }
  
    const resultado = await criarServico(
      usuarioLogado.uid,
      nome,
      duracao,
      descricao,
      disponibilidade
    );

    if(resultado.sucesso) {
      alert("Serviço publicado com sucesso!");
      setNome("");
      setDuracao("");
      setDescricao("");
      setDisponibilidade("");
    } else {
      alert("Erro ao publicar: " + resultado.erro);
    }
};
  
  return (
    <ContentConteiner
      subtitle="Gestao de servicos, disponibilidade semanal e agenda do prestador."
      title="Dashboard do prestador"
    >
      <div className="flex w-full flex-col gap-4 lg:flex-row">
        <Card className="lg:flex-1">
          <h2 className="text-lg font-semibold">Cadastrar novo servico</h2>
          <form onSubmit={handleCriarServico} className="flex w-full flex-col gap-4">
            <FormField htmlFor="service-name" label="Nome do servico">
              <input
                className={fieldClassName()}
                id="service-name"
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </FormField>

            <FormField htmlFor="service-duration" label="Duracao">
              <input
                className={fieldClassName()}
                id="service-duration"
                type="text"
                required
                value={duracao}
                onChange={(e) => setDuracao(e.target.value)}
              />
            </FormField>

            <FormField htmlFor="service-description" label="Descricao">
              <textarea
                className="w-full rounded-lg border border-bluelight/30 bg-white text-sm text-bluedark outline-none focus:border-greendark"
                id="service-description"
                rows={4}
                required
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </FormField>

            <FormField htmlFor="availability" label="Disponibilidade">
              <select
                className={fieldClassName()}
                id="availability"
                required
                value={disponibilidade}
                onChange={(e) => setDisponibilidade(e.target.value)}
              >
                <option disabled value="">
                  Selecione um turno
                </option>
                <option>Seg a Sex - Manha</option>
                <option>Seg a Sex - Tarde</option>
                <option>Sabado - Manha</option>
              </select>
            </FormField>

            <PrimaryButton type="submit">Salvar servico</PrimaryButton>
          </form>
        </Card>

        <div className="flex flex-1 flex-col gap-4">
          <Card>
            <h2 className="text-lg font-semibold">Servicos publicados</h2>
            <div className="flex w-full flex-col gap-3">
              {serviceList.map((service) => (
                <div
                  className="flex w-full flex-col gap-1 p-3 rounded-lg border border-bluelight/20"
                  key={service.id}
                >
                  <strong className="text-sm">{service.name}</strong>
                  <span className="text-sm text-bluelight">
                    {service.duration}
                  </span>
                  <span className="text-sm text-bluedark">
                    {service.description}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold">Agenda de hoje</h2>
            <div className="flex w-full flex-col gap-3">
              {providerAgenda.map((item) => (
                <div
                  className="flex w-full flex-col gap-3 p-3 rounded-lg border border-bluelight/20 md:flex-row md:items-center"
                  key={item.id}
                >
                  <div className="flex flex-1 flex-col gap-1">
                    <strong className="text-sm">{item.customer}</strong>
                    <span className="text-sm text-bluelight">
                      {item.service}
                    </span>
                    <span className="text-sm text-bluedark">
                      {item.date} as {item.time}
                    </span>
                  </div>
                  <StatusBadge value={item.status} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </ContentConteiner>
  );
}
