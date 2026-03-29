import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { clearAdminSession } from "@/lib/adminAuth";
import { auth } from "./client";
import { buscarUsuarioPorId, criarDocumentoUsuario } from "./firestore/users";

const authErrorMessages = {
  "auth/email-already-in-use": "Este e-mail ja esta cadastrado.",
  "auth/invalid-email": "Informe um e-mail valido.",
  "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
  "auth/user-not-found": "Email ou senha incorretos.",
  "auth/wrong-password": "Email ou senha incorretos.",
  "auth/invalid-credential": "Email ou senha incorretos.",
  "auth/too-many-requests":
    "Muitas tentativas de login. Tente novamente em alguns minutos.",
  "auth/network-request-failed":
    "Falha de conexao. Verifique sua internet e tente novamente.",
};

function getFirebaseAuthErrorMessage(error, fallbackMessage) {
  const errorCode = error?.code;
  return authErrorMessages[errorCode] || fallbackMessage;
}

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
    return {
      sucesso: false,
      erro: getFirebaseAuthErrorMessage(
        erro,
        "Nao foi possivel criar a conta no momento.",
      ),
    };
  }
};

export const loginUsuario = async (email, senha) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    const usuario = await buscarUsuarioPorId(userCredential.user.uid);

    if (!usuario?.perfil) {
      await signOut(auth);
      return {
        sucesso: false,
        erro: "Nao foi possivel identificar o perfil desta conta.",
      };
    }

    return { sucesso: true, user: userCredential.user, usuario };
  } catch (erro) {
    console.error("Erro ao fazer login:", erro);
    return {
      sucesso: false,
      erro: getFirebaseAuthErrorMessage(
        erro,
        "Nao foi possivel fazer login no momento.",
      ),
    };
  }
};

export const logoutUsuario = async () => {
  try {
    if (auth.currentUser) {
      await signOut(auth);
    }
    clearAdminSession();
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
