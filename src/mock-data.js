export const serviceList = [
  {
    id: "banho-e-tosa",
    name: "Banho e tosa",
    provider: "Clinica Patas Felizes",
    duration: "60 min",
    description:
      "Servico completo com higienizacao, secagem, escovacao e acabamento.",
    slots: ["08:00", "09:30", "11:00", "14:00", "16:30"],
  },
  {
    id: "consulta-veterinaria",
    name: "Consulta veterinaria",
    provider: "Dr. Rafael Moura",
    duration: "40 min",
    description:
      "Avaliacao clinica para check-up, sintomas gerais e orientacao preventiva.",
    slots: ["09:00", "10:00", "13:30", "15:30", "17:00"],
  },
  {
    id: "vacinacao",
    name: "Vacinacao",
    provider: "Centro Vet Care",
    duration: "25 min",
    description:
      "Aplicacao de vacinas com triagem previa e orientacao pos atendimento.",
    slots: ["08:30", "10:30", "12:00", "14:30", "18:00"],
  },
];

export const customerAppointments = [
  {
    id: "A-1001",
    service: "Banho e tosa",
    provider: "Clinica Patas Felizes",
    date: "2026-03-18",
    time: "09:30",
    status: "confirmado",
  },
  {
    id: "A-1002",
    service: "Consulta veterinaria",
    provider: "Dr. Rafael Moura",
    date: "2026-03-22",
    time: "15:30",
    status: "pendente",
  },
  {
    id: "A-1003",
    service: "Vacinacao",
    provider: "Centro Vet Care",
    date: "2026-03-05",
    time: "10:30",
    status: "concluido",
  },
];

export const providerAgenda = [
  {
    id: "P-1101",
    customer: "Julia Costa",
    service: "Banho e tosa",
    date: "2026-03-12",
    time: "08:00",
    status: "confirmado",
  },
  {
    id: "P-1102",
    customer: "Pedro Araujo",
    service: "Banho e tosa",
    date: "2026-03-12",
    time: "09:30",
    status: "pendente",
  },
  {
    id: "P-1103",
    customer: "Carla Nunes",
    service: "Consulta veterinaria",
    date: "2026-03-12",
    time: "13:30",
    status: "confirmado",
  },
];
