export type StaffRole = 'admin' | 'manager' | 'employee';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  passwordHash: string;
  addedAt: string;
  avatar?: string;
}

export type StaffPublic = Omit<StaffMember, 'passwordHash'>;

export function toStaffPublic(member: StaffMember): StaffPublic {
  const { passwordHash: _passwordHash, ...publicMember } = member;
  return publicMember;
}
