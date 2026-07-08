import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { RoleContext, type StaffRole } from '@/contexts/role-context';
import { useAuth, isStaffRole } from '@/contexts/auth-context';
import {
  DEFAULT_PERMISSIONS,
  getPermission as resolvePermission,
  type Section,
  type Permission,
  type EditableRolePermissions,
} from '@/lib/role-permissions';
import { setPermissionsCache } from '@/lib/permissions-cache';
import { usePermissionsQuery } from '@/hooks/permissions/use-permissions-query';
import { useUpdatePermissionsMutation } from '@/hooks/permissions/use-update-permissions-mutation';
import { useResetPermissionsMutation } from '@/hooks/permissions/use-reset-permissions-mutation';

export function RoleProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [role, setRoleState] = useState<StaffRole>('employee');
  const permissionsQuery = usePermissionsQuery();
  const updateMutation = useUpdatePermissionsMutation();
  const resetMutation = useResetPermissionsMutation();

  const editablePermissions = permissionsQuery.data ?? {
    manager: { ...DEFAULT_PERMISSIONS.manager },
    employee: { ...DEFAULT_PERMISSIONS.employee },
  };

  useEffect(() => {
    if (user && isStaffRole(user.role)) {
      setRoleState(user.role);
    }
  }, [user]);

  useEffect(() => {
    if (permissionsQuery.data) {
      setPermissionsCache(permissionsQuery.data);
    }
  }, [permissionsQuery.data]);

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

  const updatePermission = useCallback(
    (targetRole: 'manager' | 'employee', section: Section, permission: Permission) => {
      const next: EditableRolePermissions = {
        ...editablePermissions,
        [targetRole]: {
          ...editablePermissions[targetRole],
          [section]: permission,
        },
      };
      updateMutation.mutate(next);
    },
    [editablePermissions, updateMutation],
  );

  const getPermissions = useCallback(() => editablePermissions, [editablePermissions]);

  const resetPermissions = useCallback(() => {
    resetMutation.mutate();
  }, [resetMutation]);

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
      isLoadingPermissions: isAuthenticated && permissionsQuery.isLoading,
      isSavingPermissions: updateMutation.isPending || resetMutation.isPending,
    }),
    [
      role,
      editablePermissions,
      updatePermission,
      getPermissions,
      resetPermissions,
      isAuthenticated,
      permissionsQuery.isLoading,
      updateMutation.isPending,
      resetMutation.isPending,
    ],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}
