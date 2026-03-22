import { doc, getDoc, setDoc } from "firebase/firestore";
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
