import { createContext, useContext } from 'react';
import type { StaffPublic } from '@luxe-maison/shared';

export type StaffMember = StaffPublic;

export interface StaffContextValue {
  members: StaffMember[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  addMember: (member: Omit<StaffMember, 'id' | 'addedAt'>) => void;
  removeMember: (id: string) => void;
  updateMember: (id: string, data: Partial<Pick<StaffMember, 'name' | 'email' | 'role'>>) => void;
}

export const StaffContext = createContext<StaffContextValue | undefined>(undefined);

export function useStaff() {
  const ctx = useContext(StaffContext);
  if (!ctx) throw new Error('useStaff must be used within StaffProvider');
  return ctx;
}

export type { StaffRole } from '@/contexts/role-context';
