import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export const cadastrarUsuario = async (nome, email, senha, perfil) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;

    // Salva o documento na coleção 'usuarios' no Firestore
    await setDoc(doc(db, "usuarios", user.uid), {
      nome: nome,
      email: email,
      perfil: perfil,
      criadoEm: new Date()
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
}