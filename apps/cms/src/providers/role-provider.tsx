import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { RoleContext, type StaffRole } from '@/contexts/role-context';
import { useAuth, isStaffRole } from '@/contexts/auth-context';
import {
  DEFAULT_PERMISSIONS,
  loadStoredPermissions,
  getPermission as resolvePermission,
  type Section,
  type Permission,
} from '@/lib/role-permissions';

const STORAGE_KEY = 'maison-role-permissions';

export function RoleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [role, setRoleState] = useState<StaffRole>('employee');
  const [editablePermissions, setEditablePermissions] = useState(loadStoredPermissions);

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
    setEditablePermissions((prev) => {
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

  const value = useMemo(
    () => ({
      role,
      setRole,
      hasAccess,
      canEdit,
      canDelete,
      getPermission,
      updatePermission,
      getPermissions,
      resetPermissions,
    }),
    [role, editablePermissions, updatePermission, getPermissions, resetPermissions],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}
