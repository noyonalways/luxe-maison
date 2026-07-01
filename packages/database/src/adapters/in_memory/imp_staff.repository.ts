import type { StaffMember } from '@luxe-maison/core';
import type { StaffRepository } from '@luxe-maison/core';
import { mockStaff } from './seed.js';

export function createImpStaffRepository(
  initial: StaffMember[] = structuredClone(mockStaff),
): StaffRepository {
  const members = initial;

  return {
    async findAll() {
      return [...members];
    },

    async findById(id: string) {
      return members.find((m) => m.id === id) ?? null;
    },

    async findByEmail(email: string) {
      const normalized = email.toLowerCase();
      return members.find((m) => m.email.toLowerCase() === normalized) ?? null;
    },

    async create(member: StaffMember) {
      members.push(member);
      return member;
    },

    async update(id: string, updates: Partial<StaffMember>) {
      const index = members.findIndex((m) => m.id === id);
      if (index === -1) return null;
      members[index] = { ...members[index]!, ...updates };
      return members[index]!;
    },

    async delete(id: string) {
      const index = members.findIndex((m) => m.id === id);
      if (index === -1) return false;
      members.splice(index, 1);
      return true;
    },
  };
}
