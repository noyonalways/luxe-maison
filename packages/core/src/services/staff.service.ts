import type { StaffMember, StaffPublic } from '../entities/staff.entity.js';
import { toStaffPublic } from '../entities/staff.entity.js';
import type { StaffRepository } from '../repositories/staff.repository.js';

export function createStaffService(repository: StaffRepository) {
  return {
    list(): Promise<StaffPublic[]> {
      return repository.findAll().then((members) => members.map(toStaffPublic));
    },

    getById(id: string): Promise<StaffPublic | null> {
      return repository.findById(id).then((member) => (member ? toStaffPublic(member) : null));
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
