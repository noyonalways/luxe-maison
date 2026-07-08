import type { EditableRolePermissions } from '../auth/staff-permissions.auth.js';

export interface RolePermissionsRepository {
  get(): Promise<EditableRolePermissions>;
  update(permissions: EditableRolePermissions): Promise<EditableRolePermissions>;
  reset(): Promise<EditableRolePermissions>;
}
