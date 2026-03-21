import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  formatAvailabilitySummary,
  normalizeAvailability,
} from "./availability";
import { db } from "./firebase";

export const criarServico = async (
  prestadorId,
  nome,
  duracaoMinutos,
  descricao,
  disponibilidade,
) => {
  try {
    const docRef = await addDoc(collection(db, "servicos"), {
      prestadorId,
      nome,
      duracaoMinutos,
      descricao,
      disponibilidade: normalizeAvailability(disponibilidade),
      ativo: true,
    });
    return { sucesso: true, id: docRef.id };
  } catch (erro) {
    console.error("Erro ao criar servico:", erro);
    return { sucesso: false, erro: erro.message };
  }
};

export const atualizarServico = async (
  servicoId,
  prestadorId,
  nome,
  duracaoMinutos,
  descricao,
  disponibilidade,
) => {
  if (!servicoId || !prestadorId) {
    return { sucesso: false, erro: "Servico invalido." };
  }

  try {
    const servicoRef = doc(db, "servicos", servicoId);
    const servicoSnap = await getDoc(servicoRef);

    if (!servicoSnap.exists()) {
      return { sucesso: false, erro: "Servico nao encontrado." };
    }

    if (servicoSnap.data().prestadorId !== prestadorId) {
      return { sucesso: false, erro: "Voce nao pode editar este servico." };
    }

    await updateDoc(servicoRef, {
      nome,
      duracaoMinutos,
      descricao,
      disponibilidade: normalizeAvailability(disponibilidade),
    });

    return { sucesso: true };
  } catch (erro) {
    console.error("Erro ao atualizar servico:", erro);
    return { sucesso: false, erro: erro.message };
  }
};

export const deletarServico = async (servicoId, prestadorId) => {
  if (!servicoId || !prestadorId) {
    return { sucesso: false, erro: "Servico invalido." };
  }

  try {
    const servicoRef = doc(db, "servicos", servicoId);
    const servicoSnap = await getDoc(servicoRef);

    if (!servicoSnap.exists()) {
      return { sucesso: false, erro: "Servico nao encontrado." };
    }

    if (servicoSnap.data().prestadorId !== prestadorId) {
      return { sucesso: false, erro: "Voce nao pode excluir este servico." };
    }

    await deleteDoc(servicoRef);

    return { sucesso: true };
  } catch (erro) {
    console.error("Erro ao deletar servico:", erro);
    return { sucesso: false, erro: erro.message };
  }
};

const verificarConflito = async (prestadorId, data, horario) => {
  const q = query(
    collection(db, "agendamentos"),
    where("prestadorId", "==", prestadorId),
    where("data", "==", data),
    where("horario", "==", horario),
    where("status", "==", "confirmado"),
  );

  const querySnapshot = await getDocs(q);

  return !querySnapshot.empty;
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
    const temConflito = await verificarConflito(prestadorId, data, horario);

    if (temConflito) {
      return { sucesso: false, erro: "Este horario ja esta reservado." };
    }

    const docRef = await addDoc(collection(db, "agendamentos"), {
      clienteId,
      prestadorId,
      servicoId,
      data,
      horario,
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

function mapServico(servico, prestador) {
  return {
    id: servico.id,
    name: servico.nome,
    provider: prestador?.nome || "Prestador nao encontrado",
    providerId: servico.prestadorId,
    duration: servico.duracaoMinutos,
    description: servico.descricao || "",
    availability: normalizeAvailability(servico.disponibilidade),
    availabilitySummary: formatAvailabilitySummary(servico.disponibilidade),
  };
}

export const listarServicosAtivos = async () => {
  try {
    const servicosQuery = query(
      collection(db, "servicos"),
      where("ativo", "==", true),
    );

    const querySnapshot = await getDocs(servicosQuery);

    const servicos = await Promise.all(
      querySnapshot.docs.map(async (servicoDoc) => {
        const servico = { id: servicoDoc.id, ...servicoDoc.data() };
        const prestador = await getUsuario(servico.prestadorId);
        return mapServico(servico, prestador);
      }),
    );

    servicos.sort((a, b) => a.name.localeCompare(b.name));

    return { sucesso: true, servicos };
  } catch (erro) {
    console.error("Erro ao listar servicos ativos:", erro);
    return { sucesso: false, erro: erro.message };
  }
};

export const listarServicosPorPrestador = async (prestadorId) => {
  if (!prestadorId) {
    return { sucesso: false, erro: "Prestador invalido." };
  }

  try {
    const servicosQuery = query(
      collection(db, "servicos"),
      where("prestadorId", "==", prestadorId),
    );

    const querySnapshot = await getDocs(servicosQuery);

    const servicos = querySnapshot.docs.map((servicoDoc) => {
      const servico = { id: servicoDoc.id, ...servicoDoc.data() };

      return {
        ...mapServico(servico),
        active: servico.ativo !== false,
      };
    });

    servicos.sort((a, b) => a.name.localeCompare(b.name));

    return { sucesso: true, servicos };
  } catch (erro) {
    console.error("Erro ao listar servicos do prestador:", erro);
    return { sucesso: false, erro: erro.message };
  }
};

const userFieldByRole = {
  cliente: "clienteId",
  prestador: "prestadorId",
};

const getServico = async (servicoId) => {
  if (!servicoId) {
    return null;
  }

  const servicoRef = doc(db, "servicos", servicoId);
  const servicoSnap = await getDoc(servicoRef);

  if (!servicoSnap.exists()) {
    return null;
  }

  return { id: servicoSnap.id, ...servicoSnap.data() };
};

const getUsuario = async (usuarioId) => {
  if (!usuarioId) {
    return null;
  }

  const usuarioRef = doc(db, "usuarios", usuarioId);
  const usuarioSnap = await getDoc(usuarioRef);

  if (!usuarioSnap.exists()) {
    return null;
  }

  return { id: usuarioSnap.id, ...usuarioSnap.data() };
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
          getServico(agendamento.servicoId),
          getUsuario(agendamento.prestadorId),
          getUsuario(agendamento.clienteId),
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

    agendamentos.sort((a, b) => {
      const dateA = `${a.date}T${a.time || "00:00"}`;
      const dateB = `${b.date}T${b.time || "00:00"}`;
      return dateA.localeCompare(dateB);
    });

    return { sucesso: true, agendamentos };
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
          getServico(agendamento.servicoId),
          getUsuario(agendamento.clienteId),
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

    agenda.sort((a, b) => {
      const dateA = `${a.date}T${a.time || "00:00"}`;
      const dateB = `${b.date}T${b.time || "00:00"}`;
      return dateA.localeCompare(dateB);
    });

    return { sucesso: true, agenda };
  } catch (erro) {
    console.error("Erro ao listar agenda do prestador:", erro);
    return { sucesso: false, erro: erro.message };
  }
};

export const buscarServicoPorId = async (servicoId) => {
  if (!servicoId) {
    return { sucesso: false, erro: "Servico invalido." };
  }

  try {
    const servico = await getServico(servicoId);

    if (!servico) {
      return { sucesso: false, erro: "Servico nao encontrado." };
    }

    const prestador = await getUsuario(servico.prestadorId);

    return {
      sucesso: true,
      servico: mapServico(servico, prestador),
    };
  } catch (erro) {
    console.error("Erro ao buscar servico por id:", erro);
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

export const listarTodosAgendamentos = async (filters = {}) => {
  try {
    const querySnapshot = await getDocs(collection(db, "agendamentos"));

    const agendamentos = await Promise.all(
      querySnapshot.docs.map(async (agendamentoDoc) => {
        const agendamento = { id: agendamentoDoc.id, ...agendamentoDoc.data() };
        const [servico, prestador, cliente] = await Promise.all([
          getServico(agendamento.servicoId),
          getUsuario(agendamento.prestadorId),
          getUsuario(agendamento.clienteId),
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

    const filtrados = agendamentos
      .filter((item) => {
        const statusOk =
          !filters.status ||
          filters.status === "Todos" ||
          item.status === filters.status;
        const dateOk = !filters.date || item.date === filters.date;

        return statusOk && dateOk;
      })
      .sort((a, b) => {
        const dateA = `${a.date}T${a.time || "00:00"}`;
        const dateB = `${b.date}T${b.time || "00:00"}`;
        return dateA.localeCompare(dateB);
      });

    return { sucesso: true, agendamentos: filtrados };
  } catch (erro) {
    console.error("Erro ao listar todos os agendamentos:", erro);
    return { sucesso: false, erro: erro.message };
  }
};
