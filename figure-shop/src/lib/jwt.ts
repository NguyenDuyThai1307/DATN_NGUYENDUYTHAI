import { SignJWT, jwtVerify } from "jose";

export type JwtPayload = {
  userId: string;
  email: string;
  role: "CUSTOMER" | "STAFF" | "ADMIN";
  sessionVersion?: number;
};

const JWT_EXPIRES_IN = "7d";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }

  return new TextEncoder().encode(secret);
}

export async function signJwt(payload: JwtPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(getJwtSecret());
}

export async function verifyJwt(token: string) {
  const { payload } = await jwtVerify(token, getJwtSecret());

  return payload as JwtPayload;
}
