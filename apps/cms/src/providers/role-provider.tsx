import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { RoleContext, type StaffRole } from '@/contexts/role-context';
import { useAuth, isStaffRole } from '@/contexts/auth-context';
import {
  getPermission as resolvePermission,
  type Section,
  type Permission,
  type CmsRole,
} from '@/lib/role-permissions';
import { setRolesCache } from '@/lib/permissions-cache';
import { resolveRoleSlug } from '@/lib/cms-navigation';
import { usePermissionsQuery } from '@/hooks/permissions/use-permissions-query';
import { useUpdateRolePermissionMutation } from '@/hooks/permissions/use-update-role-permission-mutation';
import { useResetPermissionsMutation } from '@/hooks/permissions/use-reset-permissions-mutation';
import { useCreateRoleMutation } from '@/hooks/permissions/use-create-role-mutation';
import { useDeleteRoleMutation } from '@/hooks/permissions/use-delete-role-mutation';

export function RoleProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [role, setRoleState] = useState<StaffRole>('employee');
  const [roleSlug, setRoleSlug] = useState('employee');
  const permissionsQuery = usePermissionsQuery();
  const updatePermissionMutation = useUpdateRolePermissionMutation();
  const resetMutation = useResetPermissionsMutation();
  const createRoleMutation = useCreateRoleMutation();
  const deleteRoleMutation = useDeleteRoleMutation();

  const roles = permissionsQuery.data?.roles ?? [];
  const editableRoles = useMemo(
    () => roles.filter((r) => r.id !== 'admin'),
    [roles],
  );

  useEffect(() => {
    if (user && isStaffRole(user.role)) {
      setRoleState(user.role);
      setRoleSlug(resolveRoleSlug(user));
    }
  }, [user]);

  useEffect(() => {
    if (permissionsQuery.data) {
      setRolesCache(permissionsQuery.data.roles, permissionsQuery.data.permissions);
    }
  }, [permissionsQuery.data]);

  const setRole = (newRole: StaffRole) => {
    setRoleState(newRole);
  };

  const getPermission = (section: Section): Permission => {
    return resolvePermission(role, section, roles);
  };

  const hasAccess = (section: Section): boolean => getPermission(section) !== 'none';
  const canEdit = (section: Section): boolean => {
    const p = getPermission(section);
    return p === 'edit' || p === 'full';
  };
  const canDelete = (section: Section): boolean => getPermission(section) === 'full';

  const updatePermission = useCallback(
    (targetRoleId: string, section: Section, permission: Permission) => {
      updatePermissionMutation.mutate({ roleId: targetRoleId, section, permission });
    },
    [updatePermissionMutation],
  );

  const createRole = useCallback(
    async (input: { name: string; slug?: string }) => {
      const result = await createRoleMutation.mutateAsync(input);
      return result.role;
    },
    [createRoleMutation],
  );

  const deleteRole = useCallback(
    async (roleId: string) => {
      await deleteRoleMutation.mutateAsync(roleId);
    },
    [deleteRoleMutation],
  );

  const resetPermissions = useCallback(() => {
    resetMutation.mutate();
  }, [resetMutation]);

  const value = useMemo(
    () => ({
      role,
      roleSlug,
      roles: editableRoles,
      setRole,
      hasAccess,
      canEdit,
      canDelete,
      getPermission,
      updatePermission,
      createRole,
      deleteRole,
      resetPermissions,
      isLoadingPermissions: isAuthenticated && permissionsQuery.isLoading,
      isSavingPermissions:
        updatePermissionMutation.isPending ||
        resetMutation.isPending ||
        createRoleMutation.isPending ||
        deleteRoleMutation.isPending,
    }),
    [
      role,
      roleSlug,
      editableRoles,
      updatePermission,
      createRole,
      deleteRole,
      resetPermissions,
      isAuthenticated,
      permissionsQuery.isLoading,
      updatePermissionMutation.isPending,
      resetMutation.isPending,
      createRoleMutation.isPending,
      deleteRoleMutation.isPending,
    ],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}
