import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "./client";
import { buscarUsuarioPorId, criarDocumentoUsuario } from "./firestore/users";

export const cadastrarUsuario = async (nome, email, senha, perfil) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      senha,
    );
    const user = userCredential.user;

    await criarDocumentoUsuario({
      uid: user.uid,
      nome,
      email,
      perfil,
    });

    return { sucesso: true, user };
  } catch (erro) {
    console.error("Erro ao cadastrar usuario:", erro);
    return { sucesso: false, erro: erro.message };
  }
};

export const loginUsuario = async (email, senha) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    return { sucesso: true, user: userCredential.user };
  } catch (erro) {
    console.error("Erro ao fazer login:", erro);
    return { sucesso: false, erro: "Email ou senha incorretos." };
  }
};

export const logoutUsuario = async () => {
  try {
    await signOut(auth);
    return { sucesso: true };
  } catch (erro) {
    console.error("Erro ao fazer logout:", erro);
    return { sucesso: false, erro: "Nao foi possivel encerrar a sessao." };
  }
};

export const onUserChange = (callback) => {
  return auth.onAuthStateChanged(async (firebaseUser) => {
    if (!firebaseUser) {
      callback(null);
      return;
    }

    try {
      const usuario = await buscarUsuarioPorId(firebaseUser.uid);
      callback(usuario);
    } catch (erro) {
      console.error("Erro ao buscar usuario atual:", erro);
      callback(null);
    }
  });
};
