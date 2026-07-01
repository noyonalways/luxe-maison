import React, { createContext, useContext, useState, useEffect } from 'react';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'manager' | 'employee';
  addedAt: string;
}

interface StaffContextType {
  members: StaffMember[];
  addMember: (member: Omit<StaffMember, 'id' | 'addedAt'>) => void;
  removeMember: (id: string) => void;
  updateMember: (id: string, data: Partial<Pick<StaffMember, 'name' | 'email' | 'role'>>) => void;
}

const StaffContext = createContext<StaffContextType | undefined>(undefined);

const STORAGE_KEY = 'staff-members';

const defaultMembers: StaffMember[] = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah@luxemaison.com', role: 'manager', addedAt: '2025-12-01' },
  { id: '2', name: 'Ahmed Khan', email: 'ahmed@luxemaison.com', role: 'employee', addedAt: '2026-01-15' },
  { id: '3', name: 'Emily Chen', email: 'emily@luxemaison.com', role: 'employee', addedAt: '2026-02-20' },
];

export function StaffProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = useState<StaffMember[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultMembers;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  }, [members]);

  const addMember = (data: Omit<StaffMember, 'id' | 'addedAt'>) => {
    const newMember: StaffMember = {
      ...data,
      id: crypto.randomUUID(),
      addedAt: new Date().toISOString().split('T')[0],
    };
    setMembers(prev => [...prev, newMember]);
  };

  const removeMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const updateMember = (id: string, data: Partial<Pick<StaffMember, 'name' | 'email' | 'role'>>) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
  };

  return (
    <StaffContext.Provider value={{ members, addMember, removeMember, updateMember }}>
      {children}
    </StaffContext.Provider>
  );
}

export function useStaff() {
  const ctx = useContext(StaffContext);
  if (!ctx) throw new Error('useStaff must be used within StaffProvider');
  return ctx;
}
