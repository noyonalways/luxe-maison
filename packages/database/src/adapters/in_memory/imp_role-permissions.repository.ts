import {
  cloneDefaultPermissions,
  type EditableRolePermissions,
} from '@luxe-maison/core';
import type { RolePermissionsRepository } from '@luxe-maison/core';

export function createImpRolePermissionsRepository(
  initial: EditableRolePermissions = cloneDefaultPermissions(),
): RolePermissionsRepository {
  let permissions = structuredClone(initial);

  return {
    async get() {
      return structuredClone(permissions);
    },

    async update(next: EditableRolePermissions) {
      permissions = structuredClone(next);
      return structuredClone(permissions);
    },

    async reset() {
      permissions = cloneDefaultPermissions();
      return structuredClone(permissions);
    },
  };
}
