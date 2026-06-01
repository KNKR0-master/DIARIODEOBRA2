import { createHash, randomBytes } from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import { hash, verify } from "@node-rs/argon2";
import { database } from "../data/database.js";
import type { AccessProfile, AuthSession, User } from "../types.js";

export const SESSION_COOKIE = "diario_session";
export const CSRF_COOKIE = "diario_csrf";
const SESSION_TTL_HOURS = 8;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

type AuthContext = {
  user: User;
  session: AuthSession;
  actor: {
    actorUserId: string;
    actorName: string;
  };
};

declare module "fastify" {
  interface FastifyRequest {
    auth?: AuthContext;
  }
}

const failedAttempts = new Map<string, { count: number; lockedUntil: number }>();

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createSessionToken() {
  return randomBytes(32).toString("base64url");
}

export function createCsrfToken() {
  return randomBytes(32).toString("base64url");
}

export function validatePasswordPolicy(password: string) {
  return password.length >= 8 && password.length <= 128 && /[A-Za-z]/.test(password) && /\d/.test(password);
}

export async function hashPassword(password: string) {
  return hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1
  });
}

export async function verifyPassword(passwordHash: string, password: string) {
  if (!passwordHash) return false;
  return verify(passwordHash, password);
}

export function setSessionCookie(reply: FastifyReply, token: string, csrfToken: string) {
  reply.setCookie(SESSION_COOKIE, token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_HOURS * 60 * 60
  });
  setCsrfCookie(reply, csrfToken);
}

export function setCsrfCookie(reply: FastifyReply, csrfToken: string) {
  reply.setCookie(CSRF_COOKIE, csrfToken, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_HOURS * 60 * 60
  });
}

export function clearSessionCookie(reply: FastifyReply) {
  reply.clearCookie(SESSION_COOKIE, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
  reply.clearCookie(CSRF_COOKIE, {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
}

export function createSessionForUser(user: User, request: FastifyRequest) {
  const token = createSessionToken();
  const csrfToken = createCsrfToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_HOURS * 60 * 60 * 1000);
  const session: AuthSession = {
    id: hashSessionToken(token),
    userId: user.id,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    lastSeenAt: now.toISOString(),
    csrfTokenHash: hashSessionToken(csrfToken),
    ipAddress: request.ip,
    userAgent: request.headers["user-agent"] ?? ""
  };

  database.createAuthSession(session, { actorUserId: user.id, actorName: user.name });

  return { token, csrfToken, session };
}

export function verifyCsrfToken(request: FastifyRequest, reply: FastifyReply) {
  const method = request.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return;

  const csrfToken = request.headers["x-csrf-token"];
  const token = Array.isArray(csrfToken) ? csrfToken[0] : csrfToken;

  if (!request.auth?.session.csrfTokenHash || !token || hashSessionToken(token) !== request.auth.session.csrfTokenHash) {
    return reply.code(403).send({ error: "Invalid CSRF token" });
  }
}

export async function authenticateRequest(request: FastifyRequest, reply: FastifyReply) {
  const token = request.cookies?.[SESSION_COOKIE];

  if (!token) {
    return reply.code(401).send({ error: "Authentication required" });
  }

  const session = database.getAuthSession(hashSessionToken(token));
  const user = session ? database.getUser(session.userId) : undefined;

  if (!session || !user || user.status !== "active") {
    clearSessionCookie(reply);
    return reply.code(401).send({ error: "Authentication required" });
  }

  database.touchAuthSession(session.id);
  request.auth = {
    user,
    session,
    actor: {
      actorUserId: user.id,
      actorName: user.name
    }
  };
}

export function getAuthActor(request: FastifyRequest) {
  return request.auth?.actor ?? { actorUserId: "system", actorName: "System" };
}

export function requireProfiles(request: FastifyRequest, reply: FastifyReply, profiles: AccessProfile[]) {
  const profile = request.auth?.user.accessProfile;
  if (!profile || !profiles.includes(profile)) {
    return reply.code(403).send({ error: "Access denied" });
  }
}

export function requireWriteAccess(request: FastifyRequest, reply: FastifyReply) {
  if (request.auth?.user.accessProfile === "client_read_only") {
    return reply.code(403).send({ error: "Access denied" });
  }
}

export function getFailedLoginState(key: string) {
  const state = failedAttempts.get(key);
  if (!state) return { locked: false };

  if (state.lockedUntil > Date.now()) {
    return { locked: true };
  }

  if (state.lockedUntil > 0) {
    failedAttempts.delete(key);
  }

  return { locked: false };
}

export function recordFailedLogin(key: string) {
  const current = failedAttempts.get(key) ?? { count: 0, lockedUntil: 0 };
  const count = current.count + 1;
  failedAttempts.set(key, {
    count,
    lockedUntil: count >= MAX_FAILED_ATTEMPTS ? Date.now() + LOCKOUT_MS : 0
  });
}

export function clearFailedLogins(key: string) {
  failedAttempts.delete(key);
}
