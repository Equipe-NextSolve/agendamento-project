import { db } from "./firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";

// para o prestador criar serviço
export const criarServico = async (prestadorId, nome, duracaoMinutos, preco) => {
  try {
    const docRef = await addDoc(collection(db, "servicos"), {
      prestadorId,
      nome,
      duracaoMinutos,
      preco,
      ativo: true
    });
    return { sucesso: true, id: docRef.id };
  } catch (erro) {
    console.error("Erro ao criar serviço:", erro);
    return { sucesso: false, erro: erro.message };
  }
};

// verificar conflito de horario
const verificarConflito = async (prestadorId, data, horario) => {
  const q = query(
    collection(db, "agendamentos"),
    where("prestadorId", "==", prestadorId),
    where("data", "==", data),
    where("horario", "==", horario),
    where("status", "==", "confirmado")
  );

  const querySnapshot = await getDocs(q);
  
  return !querySnapshot.empty; 
};

// cliente criar agendamento
export const criarAgendamento = async (clienteId, prestadorId, servicoId, data, horario) => {
  try {
    // verificar se o horario esta livre
    const temConflito = await verificarConflito(prestadorId, data, horario);

    if (temConflito) {
      return { sucesso: false, erro: "Este horário já está reservado." };
    }

    const docRef = await addDoc(collection(db, "agendamentos"), {
      clienteId,
      prestadorId,
      servicoId,
      data,
      horario,
      status: "confirmado",
      criadoEm: new Date()
    });

    return { sucesso: true, id: docRef.id };
  } catch (erro) {
    console.error("Erro ao criar agendamento:", erro);
    return { sucesso: false, erro: erro.message };
  }
};