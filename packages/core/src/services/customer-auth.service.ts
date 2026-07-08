import type { AuthUser, LoginCredentials, RegisterCustomerInput } from '../entities/auth.entity.js';
import type { Customer } from '../entities/customer.entity.js';
import type { CustomerRepository } from '../repositories/customer.repository.js';
import type { PasswordVerifier } from '../services/auth.service.js';

export type PasswordHasher = (plainPassword: string) => Promise<string>;

function toCustomerAuthUser(customer: Customer): AuthUser {
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    role: 'customer',
    avatar: customer.avatar,
  };
}

export function createCustomerAuthService(
  repository: CustomerRepository,
  verifyPassword: PasswordVerifier,
  hashPassword: PasswordHasher,
) {
  return {
    async login(credentials: LoginCredentials): Promise<AuthUser | null> {
      const email = credentials.email.trim().toLowerCase();
      const customer = await repository.findByEmailForAuth(email);
      if (!customer?.passwordHash) return null;
      if (customer.status === 'blocked') return null;

      const isValid = await verifyPassword(credentials.password, customer.passwordHash);
      if (!isValid) return null;

      return toCustomerAuthUser(customer);
    },

    async register(input: RegisterCustomerInput): Promise<AuthUser | null> {
      const name = input.name.trim();
      const email = input.email.trim().toLowerCase();
      const password = input.password;

      if (!name || !email || !password) return null;
      if (password.length < 6) return null;

      const phone = input.phone?.trim();
      if (!phone) return null;

      const existing = await repository.findByEmailForAuth(email);
      if (existing) return null;

      const now = new Date().toISOString();
      const passwordHash = await hashPassword(password);
      const customer: Customer = {
        id: `cust-${Date.now()}`,
        name,
        email,
        phone,
        address: input.address?.trim() || 'Not provided at signup',
        totalOrders: 0,
        totalSpent: 0,
        status: 'active',
        joinedAt: now,
        lastOrderAt: now,
        passwordHash,
      };

      const created = await repository.create(customer);
      return toCustomerAuthUser(created);
    },

    async getUserById(id: string): Promise<AuthUser | null> {
      const customer = await repository.findById(id);
      if (!customer) return null;
      if (customer.status === 'blocked') return null;
      return toCustomerAuthUser(customer);
    },
  };
}

export type CustomerAuthService = ReturnType<typeof createCustomerAuthService>;
