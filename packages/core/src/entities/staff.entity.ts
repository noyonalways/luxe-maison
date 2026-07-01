export type TeamMemberRole = 'manager' | 'employee';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: TeamMemberRole;
  addedAt: string;
}
