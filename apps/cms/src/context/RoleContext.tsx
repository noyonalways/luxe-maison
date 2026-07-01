import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useAuth, isStaffRole } from '@/context/AuthContext';
import {
  DEFAULT_PERMISSIONS,
  loadStoredPermissions,
  getPermission as resolvePermission,
  pathToSection,
  type Section,
  type Permission,
} from '@/lib/role-permissions';

export type StaffRole = 'admin' | 'manager' | 'employee';
export type { Section, Permission };
export { DEFAULT_PERMISSIONS, pathToSection };

const STORAGE_KEY = 'maison-role-permissions';

interface RoleContextType {
  role: StaffRole;
  setRole: (role: StaffRole) => void;
  hasAccess: (section: Section) => boolean;
  canEdit: (section: Section) => boolean;
  canDelete: (section: Section) => boolean;
  getPermission: (section: Section) => Permission;
  updatePermission: (role: 'manager' | 'employee', section: Section, permission: Permission) => void;
  getPermissions: () => Record<'manager' | 'employee', Record<Section, Permission>>;
  resetPermissions: () => void;
}

const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  // Sync role from auth context
  const authRole: StaffRole = (user && isStaffRole(user.role)) ? user.role : 'admin';
  const [role, setRoleState] = useState<StaffRole>(authRole);
  const [editablePermissions, setEditablePermissions] = useState(loadStoredPermissions);

  // Keep role in sync with auth
  useEffect(() => {
    if (user && isStaffRole(user.role)) {
      setRoleState(user.role);
    }
  }, [user]);

  const setRole = (newRole: StaffRole) => {
    setRoleState(newRole);
  };

  const getPermission = (section: Section): Permission => {
    return resolvePermission(role, section, editablePermissions);
  };

  const hasAccess = (section: Section): boolean => getPermission(section) !== 'none';
  const canEdit = (section: Section): boolean => {
    const p = getPermission(section);
    return p === 'edit' || p === 'full';
  };
  const canDelete = (section: Section): boolean => getPermission(section) === 'full';

  const updatePermission = useCallback((targetRole: 'manager' | 'employee', section: Section, permission: Permission) => {
    setEditablePermissions(prev => {
      const next = {
        ...prev,
        [targetRole]: { ...prev[targetRole], [section]: permission },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const getPermissions = useCallback(() => editablePermissions, [editablePermissions]);

  const resetPermissions = useCallback(() => {
    const defaults = { manager: { ...DEFAULT_PERMISSIONS.manager }, employee: { ...DEFAULT_PERMISSIONS.employee } };
    setEditablePermissions(defaults);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  }, []);

  return (
    <RoleContext.Provider value={{ role, setRole, hasAccess, canEdit, canDelete, getPermission, updatePermission, getPermissions, resetPermissions }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}

export const VALID_ROLES: StaffRole[] = ['admin', 'manager', 'employee'];

export const ALL_SECTIONS: Section[] = [
  'dashboard', 'products', 'orders', 'customers', 'analytics',
  'newsletter', 'discounts', 'campaigns', 'popup', 'team', 'settings', 'access-control',
];
