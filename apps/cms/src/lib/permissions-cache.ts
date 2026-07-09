import { DEFAULT_PERMISSIONS, type CmsRole, type EditableRolePermissions } from '@luxe-maison/shared';

let cachedRoles: CmsRole[] = [];
let cachedPermissions: EditableRolePermissions = {
  manager: { ...DEFAULT_PERMISSIONS.manager },
  employee: { ...DEFAULT_PERMISSIONS.employee },
};

export function setRolesCache(roles: CmsRole[], permissions?: EditableRolePermissions) {
  cachedRoles = roles.map((role) => ({
    ...role,
    permissions: { ...role.permissions },
  }));
  if (permissions) {
    cachedPermissions = {
      manager: { ...permissions.manager },
      employee: { ...permissions.employee },
    };
  }
}

export function setPermissionsCache(permissions: EditableRolePermissions) {
  cachedPermissions = {
    manager: { ...permissions.manager },
    employee: { ...permissions.employee },
  };
}

export function getRolesCache(): CmsRole[] {
  return cachedRoles;
}

export function getPermissionsCache(): EditableRolePermissions {
  return cachedPermissions;
}

export function clearPermissionsCache() {
  cachedRoles = [];
  cachedPermissions = {
    manager: { ...DEFAULT_PERMISSIONS.manager },
    employee: { ...DEFAULT_PERMISSIONS.employee },
  };
}
