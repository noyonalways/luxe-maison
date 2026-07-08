import { DEFAULT_PERMISSIONS, type EditableRolePermissions } from '@luxe-maison/shared';

let cachedPermissions: EditableRolePermissions = {
  manager: { ...DEFAULT_PERMISSIONS.manager },
  employee: { ...DEFAULT_PERMISSIONS.employee },
};

export function setPermissionsCache(permissions: EditableRolePermissions) {
  cachedPermissions = {
    manager: { ...permissions.manager },
    employee: { ...permissions.employee },
  };
}

export function getPermissionsCache(): EditableRolePermissions {
  return cachedPermissions;
}

export function clearPermissionsCache() {
  cachedPermissions = {
    manager: { ...DEFAULT_PERMISSIONS.manager },
    employee: { ...DEFAULT_PERMISSIONS.employee },
  };
}
