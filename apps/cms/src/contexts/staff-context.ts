import { createContext, useContext } from 'react';
import type { StaffPublic } from '@luxe-maison/shared';
import type { CreateStaffPayload, UpdateStaffPayload } from '@/lib/api/staff.api';

export type StaffMember = StaffPublic;

export interface StaffContextValue {
  members: StaffMember[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  addMember: (member: CreateStaffPayload) => Promise<StaffMember>;
  removeMember: (id: string) => Promise<void>;
  updateMember: (id: string, data: UpdateStaffPayload) => Promise<StaffMember>;
  isSaving: boolean;
}

export const StaffContext = createContext<StaffContextValue | undefined>(undefined);

export function useStaff() {
  const ctx = useContext(StaffContext);
  if (!ctx) throw new Error('useStaff must be used within StaffProvider');
  return ctx;
}

export type { StaffRole } from '@/contexts/role-context';
