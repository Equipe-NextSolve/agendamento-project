import bcrypt from "bcryptjs";
import { doc, getDoc } from "firebase/firestore";
import { clearAdminSession, setAdminSession } from "@/lib/adminAuth";
import { db } from "../client";

const ADMIN_CREDENTIALS_COLLECTION = "configuracoes";
const ADMIN_CREDENTIALS_DOCUMENT = "admin_login";

export const loginAdmin = async (email, senha) => {
  try {
    const adminRef = doc(
      db,
      ADMIN_CREDENTIALS_COLLECTION,
      ADMIN_CREDENTIALS_DOCUMENT,
    );
    const adminSnap = await getDoc(adminRef);

    if (!adminSnap.exists()) {
      return {
        sucesso: false,
        erro: "Credenciais administrativas nao configuradas no banco.",
      };
    }

    const adminData = adminSnap.data();

    if (!adminData.email || !adminData.senha) {
      return {
        sucesso: false,
        erro: "Credenciais administrativas invalidas no banco.",
      };
    }

    const senhaCorreta = await bcrypt.compare(senha, adminData.senha);

    if (adminData.email !== email || !senhaCorreta) {
      return {
        sucesso: false,
        erro: "Email ou senha de administrador incorretos.",
      };
    }

    await setAdminSession({
      id: ADMIN_CREDENTIALS_DOCUMENT,
      nome: adminData.nome || "Administrador",
      email: adminData.email,
      perfil: "admin",
    });

    return { sucesso: true };
  } catch (erro) {
    console.error("Erro ao fazer login admin:", erro);
    return { sucesso: false, erro: "Nao foi possivel validar o login admin." };
  }
};

export const logoutAdmin = () => {
  clearAdminSession();
  return { sucesso: true };
};
