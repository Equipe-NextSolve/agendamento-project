import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  doesTimeRangeFitAvailability,
  timeToMinutes,
} from "@/lib/availability";
import { isDateTimeInPast } from "@/lib/date";
import { db } from "../client";
import { buscarServicoDocumentoPorId } from "./services";
import { buscarUsuarioPorId } from "./users";

const userFieldByRole = {
  cliente: "clienteId",
  prestador: "prestadorId",
};

const allowedStatus = ["confirmado", "pendente", "concluido", "cancelado"];

const sortAgendamentos = (items) =>
  items.sort((a, b) => {
    const dateA = `${a.date}T${a.time || "00:00"}`;
    const dateB = `${b.date}T${b.time || "00:00"}`;
    return dateA.localeCompare(dateB);
  });

const intervalsOverlap = (startA, endA, startB, endB) =>
  startA < endB && endA > startB;

const getAppointmentDuration = async (agendamento) => {
  const storedDuration = Number(agendamento.duracaoMinutos);

  if (Number.isFinite(storedDuration) && storedDuration > 0) {
    return storedDuration;
  }

  const servico = await buscarServicoDocumentoPorId(agendamento.servicoId);
  const serviceDuration = Number(servico?.duracaoMinutos);

  return Number.isFinite(serviceDuration) && serviceDuration > 0
    ? serviceDuration
    : 0;
};

const verificarConflito = async (
  prestadorId,
  data,
  horario,
  duracaoMinutos,
) => {
  const agendaQuery = query(
    collection(db, "agendamentos"),
    where("prestadorId", "==", prestadorId),
    where("data", "==", data),
  );

  const querySnapshot = await getDocs(agendaQuery);
  const requestedStart = timeToMinutes(horario);
  const requestedEnd =
    requestedStart === null ? null : requestedStart + duracaoMinutos;

  if (requestedStart === null || requestedEnd === null) {
    return true;
  }

  for (const agendamentoDoc of querySnapshot.docs) {
    const agendamento = agendamentoDoc.data();

    if (agendamento.status === "cancelado") {
      continue;
    }

    const existingStart = timeToMinutes(agendamento.horario);
    const existingDuration = await getAppointmentDuration(agendamento);
    const existingEnd =
      existingStart === null ? null : existingStart + existingDuration;

    if (
      existingStart !== null &&
      existingEnd !== null &&
      intervalsOverlap(requestedStart, requestedEnd, existingStart, existingEnd)
    ) {
      return true;
    }
  }

  return false;
};

export const criarAgendamento = async (
  clienteId,
  prestadorId,
  servicoId,
  data,
  horario,
  pet,
  observacoes,
) => {
  try {
    const servico = await buscarServicoDocumentoPorId(servicoId);
    const duracaoMinutos = Number(servico?.duracaoMinutos);

    if (!servico || !Number.isFinite(duracaoMinutos) || duracaoMinutos <= 0) {
      return { sucesso: false, erro: "Servico invalido para agendamento." };
    }

    if (isDateTimeInPast(data, horario)) {
      return {
        sucesso: false,
        erro: "Nao e possivel agendar para um horario que ja passou.",
      };
    }

    if (
      !doesTimeRangeFitAvailability(
        servico.disponibilidade,
        data,
        horario,
        duracaoMinutos,
      )
    ) {
      return {
        sucesso: false,
        erro: "O horario escolhido nao cabe na disponibilidade do prestador.",
      };
    }

    const temConflito = await verificarConflito(
      prestadorId,
      data,
      horario,
      duracaoMinutos,
    );

    if (temConflito) {
      return {
        sucesso: false,
        erro: "Este horario conflita com outro agendamento existente.",
      };
    }

    const docRef = await addDoc(collection(db, "agendamentos"), {
      clienteId,
      prestadorId,
      servicoId,
      data,
      horario,
      duracaoMinutos,
      pet,
      observacoes: observacoes || "",
      status: "confirmado",
      criadoEm: new Date(),
    });

    return { sucesso: true, id: docRef.id };
  } catch (erro) {
    console.error("Erro ao criar agendamento:", erro);
    return { sucesso: false, erro: erro.message };
  }
};

export const listarAgendamentosPorUsuario = async (usuarioId, perfil) => {
  const field = userFieldByRole[perfil];

  if (!usuarioId || !field) {
    return { sucesso: false, erro: "Perfil de usuario invalido." };
  }

  try {
    const agendamentosQuery = query(
      collection(db, "agendamentos"),
      where(field, "==", usuarioId),
    );

    const querySnapshot = await getDocs(agendamentosQuery);

    const agendamentos = await Promise.all(
      querySnapshot.docs.map(async (agendamentoDoc) => {
        const agendamento = { id: agendamentoDoc.id, ...agendamentoDoc.data() };
        const [servico, prestador, cliente] = await Promise.all([
          buscarServicoDocumentoPorId(agendamento.servicoId),
          buscarUsuarioPorId(agendamento.prestadorId),
          buscarUsuarioPorId(agendamento.clienteId),
        ]);

        return {
          id: agendamento.id,
          service: servico?.nome || "Servico indisponivel",
          provider: prestador?.nome || "Prestador nao encontrado",
          customer: cliente?.nome || "Cliente nao encontrado",
          date: agendamento.data,
          time: agendamento.horario,
          status: agendamento.status,
        };
      }),
    );

    return { sucesso: true, agendamentos: sortAgendamentos(agendamentos) };
  } catch (erro) {
    console.error("Erro ao listar agendamentos do usuario:", erro);
    return { sucesso: false, erro: erro.message };
  }
};

export const listarAgendaDoPrestador = async (prestadorId, data) => {
  if (!prestadorId) {
    return { sucesso: false, erro: "Prestador invalido." };
  }

  try {
    let agendaQuery = query(
      collection(db, "agendamentos"),
      where("prestadorId", "==", prestadorId),
    );

    if (data) {
      agendaQuery = query(
        collection(db, "agendamentos"),
        where("prestadorId", "==", prestadorId),
        where("data", "==", data),
      );
    }

    const querySnapshot = await getDocs(agendaQuery);

    const agenda = await Promise.all(
      querySnapshot.docs.map(async (agendamentoDoc) => {
        const agendamento = { id: agendamentoDoc.id, ...agendamentoDoc.data() };
        const [servico, cliente] = await Promise.all([
          buscarServicoDocumentoPorId(agendamento.servicoId),
          buscarUsuarioPorId(agendamento.clienteId),
        ]);

        return {
          id: agendamento.id,
          customer: cliente?.nome || "Cliente nao encontrado",
          service: servico?.nome || "Servico indisponivel",
          date: agendamento.data,
          time: agendamento.horario,
          status: agendamento.status,
          pet: agendamento.pet || "",
          notes: agendamento.observacoes || "",
        };
      }),
    );

    return { sucesso: true, agenda: sortAgendamentos(agenda) };
  } catch (erro) {
    console.error("Erro ao listar agenda do prestador:", erro);
    return { sucesso: false, erro: erro.message };
  }
};

export const listarHorariosOcupados = async (prestadorId, data) => {
  if (!prestadorId || !data) {
    return { sucesso: false, erro: "Parametros invalidos para consulta." };
  }

  try {
    const agendaQuery = query(
      collection(db, "agendamentos"),
      where("prestadorId", "==", prestadorId),
      where("data", "==", data),
    );

    const querySnapshot = await getDocs(agendaQuery);

    const horarios = querySnapshot.docs
      .map((agendamentoDoc) => agendamentoDoc.data())
      .filter((agendamento) => agendamento.status !== "cancelado")
      .map((agendamento) => agendamento.horario)
      .sort();

    return { sucesso: true, horarios };
  } catch (erro) {
    console.error("Erro ao listar horarios ocupados:", erro);
    return { sucesso: false, erro: erro.message };
  }
};

export const listarIntervalosOcupados = async (prestadorId, data) => {
  if (!prestadorId || !data) {
    return { sucesso: false, erro: "Parametros invalidos para consulta." };
  }

  try {
    const agendaQuery = query(
      collection(db, "agendamentos"),
      where("prestadorId", "==", prestadorId),
      where("data", "==", data),
    );

    const querySnapshot = await getDocs(agendaQuery);

    const intervalos = await Promise.all(
      querySnapshot.docs.map(async (agendamentoDoc) => {
        const agendamento = agendamentoDoc.data();

        return {
          id: agendamentoDoc.id,
          status: agendamento.status,
          time: agendamento.horario,
          durationMinutos: await getAppointmentDuration(agendamento),
        };
      }),
    );

    return {
      sucesso: true,
      intervalos: intervalos
        .filter((intervalo) => intervalo.status !== "cancelado")
        .sort((a, b) => a.time.localeCompare(b.time)),
    };
  } catch (erro) {
    console.error("Erro ao listar intervalos ocupados:", erro);
    return { sucesso: false, erro: erro.message };
  }
};

export const listarTodosAgendamentos = async (filters = {}) => {
  try {
    const querySnapshot = await getDocs(collection(db, "agendamentos"));

    const agendamentos = await Promise.all(
      querySnapshot.docs.map(async (agendamentoDoc) => {
        const agendamento = { id: agendamentoDoc.id, ...agendamentoDoc.data() };
        const [servico, prestador, cliente] = await Promise.all([
          buscarServicoDocumentoPorId(agendamento.servicoId),
          buscarUsuarioPorId(agendamento.prestadorId),
          buscarUsuarioPorId(agendamento.clienteId),
        ]);

        return {
          id: agendamento.id,
          service: servico?.nome || "Servico indisponivel",
          provider: prestador?.nome || "Prestador nao encontrado",
          customer: cliente?.nome || "Cliente nao encontrado",
          date: agendamento.data,
          time: agendamento.horario,
          status: agendamento.status,
        };
      }),
    );

    const filtrados = agendamentos.filter((item) => {
      const statusOk =
        !filters.status ||
        filters.status === "Todos" ||
        item.status === filters.status;
      const dateOk = !filters.date || item.date === filters.date;

      return statusOk && dateOk;
    });

    return { sucesso: true, agendamentos: sortAgendamentos(filtrados) };
  } catch (erro) {
    console.error("Erro ao listar todos os agendamentos:", erro);
    return { sucesso: false, erro: erro.message };
  }
};

export const atualizarStatusAgendamentoPrestador = async (
  agendamentoId,
  prestadorId,
  status,
) => {
  if (!agendamentoId || !prestadorId) {
    return { sucesso: false, erro: "Agendamento invalido." };
  }

  if (!allowedStatus.includes(status)) {
    return { sucesso: false, erro: "Status invalido." };
  }

  try {
    const agendamentoRef = doc(db, "agendamentos", agendamentoId);
    const agendamentoSnap = await getDoc(agendamentoRef);

    if (!agendamentoSnap.exists()) {
      return { sucesso: false, erro: "Agendamento nao encontrado." };
    }

    if (agendamentoSnap.data().prestadorId !== prestadorId) {
      return {
        sucesso: false,
        erro: "Voce nao pode alterar o status deste agendamento.",
      };
    }

    await updateDoc(agendamentoRef, { status });

    return { sucesso: true };
  } catch (erro) {
    console.error("Erro ao atualizar status do agendamento:", erro);
    return { sucesso: false, erro: erro.message };
  }
};

export const cancelarAgendamentoCliente = async (agendamentoId, clienteId) => {
  if (!agendamentoId || !clienteId) {
    return { sucesso: false, erro: "Agendamento invalido." };
  }

  try {
    const agendamentoRef = doc(db, "agendamentos", agendamentoId);
    const agendamentoSnap = await getDoc(agendamentoRef);

    if (!agendamentoSnap.exists()) {
      return { sucesso: false, erro: "Agendamento nao encontrado." };
    }

    const agendamento = agendamentoSnap.data();

    if (agendamento.clienteId !== clienteId) {
      return {
        sucesso: false,
        erro: "Voce nao pode cancelar este agendamento.",
      };
    }

    if (agendamento.status === "cancelado") {
      return { sucesso: false, erro: "Este agendamento ja foi cancelado." };
    }

    if (agendamento.status === "concluido") {
      return {
        sucesso: false,
        erro: "Nao e possivel cancelar um agendamento concluido.",
      };
    }

    await updateDoc(agendamentoRef, { status: "cancelado" });

    return { sucesso: true };
  } catch (erro) {
    console.error("Erro ao cancelar agendamento do cliente:", erro);
    return { sucesso: false, erro: erro.message };
  }
};
