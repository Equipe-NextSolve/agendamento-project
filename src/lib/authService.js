import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export const cadastrarUsuario = async (nome, email, senha, perfil) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      senha,
    );
    const user = userCredential.user;

    // Salva o documento na coleção 'usuarios' no Firestore
    await setDoc(doc(db, "usuarios", user.uid), {
      nome: nome,
      email: email,
      perfil: perfil,
      criadoEm: new Date(),
    });

    return { sucesso: true, user };
  } catch (erro) {
    console.error("Erro ao cadastrar usuário:", erro);
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
      const docRef = doc(db, "usuarios", firebaseUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        callback({ id: firebaseUser.uid, ...docSnap.data() });
      } else {
        callback(null);
      }
    } catch (erro) {
      console.error("Erro ao buscar usuário atual:", erro);
      callback(null);
    }
  });
};
