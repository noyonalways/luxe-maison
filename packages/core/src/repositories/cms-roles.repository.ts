import type { CmsRole } from '../entities/cms-role.entity.js';
import type { CmsSection, Permission } from '../auth/staff-permissions.auth.js';

export interface CmsRolesRepository {
  findAll(): Promise<CmsRole[]>;
  findById(id: string): Promise<CmsRole | null>;
  findBySlug(slug: string): Promise<CmsRole | null>;
  create(role: CmsRole): Promise<CmsRole>;
  update(id: string, updates: Partial<Pick<CmsRole, 'name' | 'slug' | 'permissions'>>): Promise<CmsRole | null>;
  delete(id: string): Promise<boolean>;
  updatePermission(roleId: string, section: CmsSection, permission: Permission): Promise<CmsRole | null>;
}
