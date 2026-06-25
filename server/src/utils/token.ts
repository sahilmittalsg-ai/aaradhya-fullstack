import jwt, { SignOptions } from "jsonwebtoken";

export type TokenRole = "admin" | "client" | "user";
export type AuthTokenPayload = {
  id: string;
  role: TokenRole;
  tokenType?: "access" | "refresh";
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === "production" && (!secret || secret === "dev-secret" || secret === "change-this-secret")) {
    throw new Error("JWT_SECRET must be configured for production");
  }
  return secret || "dev-secret";
}

function signJwt(payload: AuthTokenPayload, expiresIn: string) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: expiresIn as SignOptions["expiresIn"] });
}

export function signAccessToken(payload: Omit<AuthTokenPayload, "tokenType">) {
  return signJwt({ ...payload, tokenType: "access" }, process.env.JWT_ACCESS_EXPIRES_IN || "15m");
}

export function signRefreshToken(payload: Omit<AuthTokenPayload, "tokenType">) {
  return signJwt({ ...payload, tokenType: "refresh" }, process.env.JWT_REFRESH_EXPIRES_IN || "30d");
}

export function verifyToken(token: string) {
  return jwt.verify(token, getJwtSecret()) as AuthTokenPayload;
}

export function signToken(payload: object) {
  return signAccessToken(payload as Omit<AuthTokenPayload, "tokenType">);
}
