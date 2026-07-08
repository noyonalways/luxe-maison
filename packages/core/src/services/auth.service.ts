import type { AuthUser, LoginCredentials } from '../entities/auth.entity.js';
import type { StaffMember } from '../entities/staff.entity.js';
import type { StaffRepository } from '../repositories/staff.repository.js';

export type PasswordVerifier = (
  plainPassword: string,
  passwordHash: string,
) => boolean | Promise<boolean>;

function toAuthUser(member: StaffMember): AuthUser {
  return {
    id: member.id,
    name: member.name,
    email: member.email,
    role: member.role,
    avatar: member.avatar,
  };
}

export function createAuthService(
  repository: StaffRepository,
  verifyPassword: PasswordVerifier,
) {
  return {
    async login(credentials: LoginCredentials): Promise<AuthUser | null> {
      const email = credentials.email.trim().toLowerCase();
      const member = await repository.findByEmail(email);
      if (!member) return null;

      const isValid = await verifyPassword(credentials.password, member.passwordHash);
      if (!isValid) return null;

      return toAuthUser(member);
    },

    async getUserById(id: string): Promise<AuthUser | null> {
      const member = await repository.findById(id);
      if (!member) return null;
      return toAuthUser(member);
    },
  };
}

export type AuthService = ReturnType<typeof createAuthService>;
