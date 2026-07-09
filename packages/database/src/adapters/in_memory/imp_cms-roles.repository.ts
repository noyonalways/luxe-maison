import type { CmsRole, CmsRolesRepository, CmsSection, Permission } from '@luxe-maison/core';

export function createImpCmsRolesRepository(): CmsRolesRepository {
  const roles = new Map<string, CmsRole>();

  return {
    async findAll() {
      return [...roles.values()].sort((a, b) => {
        if (a.isSystem !== b.isSystem) return a.isSystem ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
    },

    async findById(id: string) {
      return roles.get(id) ?? null;
    },

    async findBySlug(slug: string) {
      return [...roles.values()].find((r) => r.slug === slug) ?? null;
    },

    async create(role: CmsRole) {
      roles.set(role.id, { ...role });
      return { ...role };
    },

    async update(id, updates) {
      const current = roles.get(id);
      if (!current) return null;
      const next = { ...current, ...updates };
      roles.set(id, next);
      return { ...next };
    },

    async delete(id: string) {
      const current = roles.get(id);
      if (!current || current.isSystem) return false;
      return roles.delete(id);
    },

    async updatePermission(roleId: string, section: CmsSection, permission: Permission) {
      const current = roles.get(roleId);
      if (!current) return null;
      const next = {
        ...current,
        permissions: { ...current.permissions, [section]: permission },
      };
      roles.set(roleId, next);
      return { ...next };
    },
  };
}
