import {
  cloneDefaultPermissions,
  normalizeRolePermissions,
  type EditableRolePermissions,
} from '../auth/staff-permissions.auth.js';
import type { RolePermissionsRepository } from '../repositories/role-permissions.repository.js';

export function createRolePermissionsService(repository: RolePermissionsRepository) {
  return {
    get(): Promise<EditableRolePermissions> {
      return repository.get();
    },

    update(permissions: EditableRolePermissions): Promise<EditableRolePermissions> {
      return repository.update(normalizeRolePermissions(permissions));
    },

    reset(): Promise<EditableRolePermissions> {
      return repository.reset();
    },

    defaults(): EditableRolePermissions {
      return cloneDefaultPermissions();
    },
  };
}

export type RolePermissionsService = ReturnType<typeof createRolePermissionsService>;
