import { jwtVerify, SignJWT } from "jose";

const ADMIN_SESSION_COOKIE = "pet_scheduler_admin_token";
const ADMIN_SESSION_EVENT = "pet-scheduler-admin-session-change";
const ADMIN_SESSION_DURATION_SECONDS = 60 * 60 * 8;
const jwtSecret = new TextEncoder().encode(
  process.env.NEXT_PUBLIC_ADMIN_JWT_SECRET || "pet-scheduler-admin-secret",
);

function isBrowser() {
  return typeof window !== "undefined";
}

function getCookieValue(cookieName) {
  if (!isBrowser()) {
    return "";
  }

  const cookieEntry = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${cookieName}=`));

  return cookieEntry ? decodeURIComponent(cookieEntry.split("=")[1]) : "";
}

function setCookieValue(cookieName, value, maxAgeInSeconds) {
  if (!isBrowser()) {
    return;
  }

  document.cookie = `${cookieName}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeInSeconds}; samesite=lax`;
}

function clearCookieValue(cookieName) {
  if (!isBrowser()) {
    return;
  }

  document.cookie = `${cookieName}=; path=/; max-age=0; samesite=lax`;
}

function emitAdminSessionChange() {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event(ADMIN_SESSION_EVENT));
}

export async function getAdminSession() {
  const token = getCookieValue(ADMIN_SESSION_COOKIE);

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, jwtSecret);

    return {
      id: String(payload.id || "admin_login"),
      nome: String(payload.nome || "Administrador"),
      email: String(payload.email || ""),
      perfil: "admin",
    };
  } catch {
    clearCookieValue(ADMIN_SESSION_COOKIE);
    return null;
  }
}

export async function setAdminSession(session) {
  if (!isBrowser()) {
    return;
  }

  const token = await new SignJWT({
    id: session.id,
    nome: session.nome,
    email: session.email,
    perfil: "admin",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_SESSION_DURATION_SECONDS}s`)
    .sign(jwtSecret);

  setCookieValue(ADMIN_SESSION_COOKIE, token, ADMIN_SESSION_DURATION_SECONDS);
  emitAdminSessionChange();
}

export function clearAdminSession() {
  clearCookieValue(ADMIN_SESSION_COOKIE);
  emitAdminSessionChange();
}

export function subscribeAdminSession(callback) {
  if (!isBrowser()) {
    return () => {};
  }

  const handleSessionChange = async () => {
    callback(await getAdminSession());
  };

  handleSessionChange();
  window.addEventListener(ADMIN_SESSION_EVENT, handleSessionChange);

  return () => {
    window.removeEventListener(ADMIN_SESSION_EVENT, handleSessionChange);
  };
}
