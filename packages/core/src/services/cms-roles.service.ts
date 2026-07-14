import {
  ALL_SECTIONS,
  DEFAULT_PERMISSIONS,
  normalizeRolePermissions,
  type CmsSection,
  type EditableRolePermissions,
  type Permission,
} from '../auth/staff-permissions.auth.js';
import {
  createRoleId,
  isValidRoleSlug,
  slugifyRoleName,
  type CmsRole,
} from '../entities/cms-role.entity.js';
import type { CmsRolesRepository } from '../repositories/cms-roles.repository.js';

function emptyPermissions(): Record<CmsSection, Permission> {
  return ALL_SECTIONS.reduce(
    (acc, section) => {
      acc[section] = 'none';
      return acc;
    },
    {} as Record<CmsSection, Permission>,
  );
}

function createSystemRole(
  id: 'manager' | 'employee',
  name: string,
  permissions: Record<CmsSection, Permission>,
): CmsRole {
  return {
    id,
    name,
    slug: id,
    isSystem: true,
    permissions,
    createdAt: new Date().toISOString().slice(0, 10),
  };
}

export function rolesToEditablePermissions(roles: CmsRole[]): EditableRolePermissions {
  const manager = roles.find((r) => r.id === 'manager');
  const employee = roles.find((r) => r.id === 'employee');
  return normalizeRolePermissions({
    manager: manager?.permissions,
    employee: employee?.permissions,
  });
}

export function createCmsRolesService(repository: CmsRolesRepository) {
  async function ensureSeeded(): Promise<CmsRole[]> {
    let roles = await repository.findAll();
    if (roles.length > 0) return roles;

    await repository.create(
      createSystemRole('manager', 'Manager', DEFAULT_PERMISSIONS.manager),
    );
    await repository.create(
      createSystemRole('employee', 'Employee', DEFAULT_PERMISSIONS.employee),
    );
    return repository.findAll();
  }

  return {
    async list(): Promise<CmsRole[]> {
      return ensureSeeded();
    },

    async getById(id: string): Promise<CmsRole | null> {
      await ensureSeeded();
      return repository.findById(id);
    },

    async getBySlug(slug: string): Promise<CmsRole | null> {
      await ensureSeeded();
      return repository.findBySlug(slug);
    },

    async resolveSlugForRole(roleId: string): Promise<string | null> {
      if (roleId === 'admin') return 'admin';
      const role = await this.getById(roleId);
      return role?.slug ?? null;
    },

    async createCustomRole(input: {
      name: string;
      slug?: string;
      permissions?: Partial<Record<CmsSection, Permission>>;
    }): Promise<CmsRole> {
      await ensureSeeded();
      const name = input.name.trim();
      if (!name) throw new Error('Role name is required');

      let slug = input.slug?.trim().toLowerCase() || slugifyRoleName(name);
      if (!isValidRoleSlug(slug)) {
        throw new Error('Invalid role slug');
      }

      const existingSlug = await repository.findBySlug(slug);
      if (existingSlug) throw new Error('A role with this slug already exists');

      const permissions = { ...emptyPermissions(), ...input.permissions };
      const role: CmsRole = {
        id: createRoleId(),
        name,
        slug,
        isSystem: false,
        permissions,
        createdAt: new Date().toISOString().slice(0, 10),
      };

      return repository.create(role);
    },

    async updateRole(
      id: string,
      updates: {
        name?: string;
        slug?: string;
        permissions?: Partial<Record<CmsSection, Permission>>;
      },
    ): Promise<CmsRole | null> {
      await ensureSeeded();
      const current = await repository.findById(id);
      if (!current) return null;

      const next: Partial<Pick<CmsRole, 'name' | 'slug' | 'permissions'>> = {};

      if (updates.name !== undefined) {
        const name = updates.name.trim();
        if (!name) throw new Error('Role name cannot be empty');
        next.name = name;
      }

      if (updates.slug !== undefined) {
        const slug = updates.slug.trim().toLowerCase();
        if (!isValidRoleSlug(slug)) throw new Error('Invalid role slug');
        const taken = await repository.findBySlug(slug);
        if (taken && taken.id !== id) throw new Error('A role with this slug already exists');
        next.slug = slug;
      }

      if (updates.permissions !== undefined) {
        next.permissions = { ...current.permissions, ...updates.permissions };
      }

      return repository.update(id, next);
    },

    async updatePermission(roleId: string, section: CmsSection, permission: Permission): Promise<CmsRole | null> {
      await ensureSeeded();
      return repository.updatePermission(roleId, section, permission);
    },

    async deleteRole(id: string): Promise<boolean> {
      await ensureSeeded();
      const role = await repository.findById(id);
      if (!role || role.isSystem) return false;
      return repository.delete(id);
    },

    async resetSystemRoles(): Promise<CmsRole[]> {
      await ensureSeeded();
      for (const [id, perms] of Object.entries(DEFAULT_PERMISSIONS) as [
        'manager' | 'employee',
        Record<CmsSection, Permission>,
      ][]) {
        await repository.update(id, { permissions: perms });
      }
      return repository.findAll();
    },

    editablePermissions(): Promise<EditableRolePermissions> {
      return this.list().then(rolesToEditablePermissions);
    },
  };
}

export type CmsRolesService = ReturnType<typeof createCmsRolesService>;
