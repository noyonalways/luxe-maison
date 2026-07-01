import type { StaffMember } from '../entities/staff.entity.js';
import type { StaffRepository } from '../repositories/staff.repository.js';

export function createStaffService(repository: StaffRepository) {
  return {
    list(): Promise<StaffMember[]> {
      return repository.findAll();
    },

    getById(id: string): Promise<StaffMember | null> {
      return repository.findById(id);
    },

    getByEmail(email: string): Promise<StaffMember | null> {
      return repository.findByEmail(email);
    },

    create(member: StaffMember): Promise<StaffMember> {
      return repository.create(member);
    },

    update(id: string, updates: Partial<StaffMember>): Promise<StaffMember | null> {
      return repository.update(id, updates);
    },

    delete(id: string): Promise<boolean> {
      return repository.delete(id);
    },
  };
}

export type StaffService = ReturnType<typeof createStaffService>;
