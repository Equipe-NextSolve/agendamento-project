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
} from "@/lib/availability";
import { db } from "../client";
import { buscarUsuarioPorId } from "./users";

const normalizeDuration = (duration) => {
  const parsedDuration = Number(duration);

  if (!Number.isFinite(parsedDuration)) {
    return null;
  }

  return Math.max(1, Math.round(parsedDuration));
};

const mapServico = (servico, prestador) => ({
  id: servico.id,
  name: servico.nome,
  provider: prestador?.nome || "Prestador nao encontrado",
  providerId: servico.prestadorId,
  duration: normalizeDuration(servico.duracaoMinutos),
  description: servico.descricao || "",
  availability: normalizeAvailability(servico.disponibilidade),
  availabilitySummary: formatAvailabilitySummary(servico.disponibilidade),
});

export const buscarServicoDocumentoPorId = async (servicoId) => {
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

export const criarServico = async (
  prestadorId,
  nome,
  duracaoMinutos,
  descricao,
  disponibilidade,
) => {
  try {
    const duration = normalizeDuration(duracaoMinutos);

    const docRef = await addDoc(collection(db, "servicos"), {
      prestadorId,
      nome,
      duracaoMinutos: duration,
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
    const duration = normalizeDuration(duracaoMinutos);
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
      duracaoMinutos: duration,
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
        const prestador = await buscarUsuarioPorId(servico.prestadorId);
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

export const buscarServicoPorId = async (servicoId) => {
  if (!servicoId) {
    return { sucesso: false, erro: "Servico invalido." };
  }

  try {
    const servico = await buscarServicoDocumentoPorId(servicoId);

    if (!servico) {
      return { sucesso: false, erro: "Servico nao encontrado." };
    }

    const prestador = await buscarUsuarioPorId(servico.prestadorId);

    return {
      sucesso: true,
      servico: mapServico(servico, prestador),
    };
  } catch (erro) {
    console.error("Erro ao buscar servico por id:", erro);
    return { sucesso: false, erro: erro.message };
  }
};
