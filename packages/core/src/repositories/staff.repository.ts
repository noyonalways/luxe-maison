import type { StaffMember } from '../entities/staff.entity.js';

export interface StaffRepository {
  findAll(): Promise<StaffMember[]>;
  findById(id: string): Promise<StaffMember | null>;
  findByEmail(email: string): Promise<StaffMember | null>;
  create(member: StaffMember): Promise<StaffMember>;
  update(id: string, updates: Partial<StaffMember>): Promise<StaffMember | null>;
  delete(id: string): Promise<boolean>;
}
