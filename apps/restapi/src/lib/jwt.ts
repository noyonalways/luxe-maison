import { SignJWT, jwtVerify } from 'jose';
import type { AuthUser, JwtPayload, UserRole } from '@luxe-maison/core';

const DEFAULT_EXPIRES_IN = '7d';

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return new TextEncoder().encode(secret);
}

function parseExpiresIn(value: string): number {
  const match = value.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60;

  const amount = Number(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's':
      return amount;
    case 'm':
      return amount * 60;
    case 'h':
      return amount * 60 * 60;
    case 'd':
      return amount * 24 * 60 * 60;
    default:
      return 7 * 24 * 60 * 60;
  }
}

function isUserRole(role: string): role is UserRole {
  if (role === 'customer') return true;
  if (role === 'admin' || role === 'manager' || role === 'employee') return true;
  return role.startsWith('role-');
}

export async function signAccessToken(user: AuthUser): Promise<{ accessToken: string; expiresAt: string }> {
  const expiresIn = process.env.JWT_EXPIRES_IN ?? DEFAULT_EXPIRES_IN;
  const expiresInSeconds = parseExpiresIn(expiresIn);
  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();

  const accessToken = await new SignJWT({
    email: user.email,
    role: user.role,
    name: user.name,
    ...(user.roleSlug ? { roleSlug: user.roleSlug } : {}),
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret());

  return { accessToken, expiresAt };
}

export async function verifyAccessToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, getSecret(), {
    algorithms: ['HS256'],
  });

  const sub = payload.sub;
  const email = payload.email;
  const role = payload.role;
  const name = payload.name;
  const roleSlug = payload.roleSlug;

  if (
    typeof sub !== 'string' ||
    typeof email !== 'string' ||
    typeof role !== 'string' ||
    typeof name !== 'string'
  ) {
    throw new Error('Invalid token payload');
  }

  if (!isUserRole(role)) {
    throw new Error('Invalid token role');
  }

  return {
    sub,
    email,
    role,
    name,
    ...(typeof roleSlug === 'string' ? { roleSlug } : {}),
  };
}
