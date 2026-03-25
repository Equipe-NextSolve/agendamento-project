import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../client";

export const criarDocumentoUsuario = async ({ uid, nome, email, perfil }) => {
  await setDoc(doc(db, "usuarios", uid), {
    nome,
    email,
    perfil,
    criadoEm: new Date(),
  });
};

export const buscarUsuarioPorId = async (usuarioId) => {
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

export const listarPrestadores = async () => {
  try {
    const prestadoresQuery = query(
      collection(db, "usuarios"),
      where("perfil", "==", "prestador"),
    );
    const querySnapshot = await getDocs(prestadoresQuery);

    const prestadores = querySnapshot.docs
      .map((usuarioDoc) => ({
        id: usuarioDoc.id,
        ...usuarioDoc.data(),
      }))
      .sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));

    return { sucesso: true, prestadores };
  } catch (erro) {
    console.error("Erro ao listar prestadores:", erro);
    return { sucesso: false, erro: erro.message };
  }
};

export const deletarPrestadorAdmin = async (prestadorId) => {
  if (!prestadorId) {
    return { sucesso: false, erro: "Prestador invalido." };
  }

  try {
    const prestadorRef = doc(db, "usuarios", prestadorId);
    const prestadorSnap = await getDoc(prestadorRef);

    if (!prestadorSnap.exists()) {
      return { sucesso: false, erro: "Prestador nao encontrado." };
    }

    if (prestadorSnap.data().perfil !== "prestador") {
      return {
        sucesso: false,
        erro: "O usuario informado nao e um prestador.",
      };
    }

    const servicosQuery = query(
      collection(db, "servicos"),
      where("prestadorId", "==", prestadorId),
    );
    const agendamentosQuery = query(
      collection(db, "agendamentos"),
      where("prestadorId", "==", prestadorId),
    );

    const [servicosSnapshot, agendamentosSnapshot] = await Promise.all([
      getDocs(servicosQuery),
      getDocs(agendamentosQuery),
    ]);

    const batch = writeBatch(db);

    batch.delete(prestadorRef);

    servicosSnapshot.docs.forEach((servicoDoc) => {
      batch.delete(servicoDoc.ref);
    });

    agendamentosSnapshot.docs.forEach((agendamentoDoc) => {
      batch.delete(agendamentoDoc.ref);
    });

    await batch.commit();

    return {
      sucesso: true,
      servicosRemovidos: servicosSnapshot.size,
      agendamentosRemovidos: agendamentosSnapshot.size,
    };
  } catch (erro) {
    console.error("Erro ao deletar prestador:", erro);
    return { sucesso: false, erro: erro.message };
  }
};
