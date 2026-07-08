import { getRolePermissionsRepository } from '@luxe-maison/database';
import { createRolePermissionsService } from '@luxe-maison/core';
import { createRequireSection } from '../middleware/permissions.middleware.js';

const rolePermissionsRepository = getRolePermissionsRepository();
export const rolePermissionsService = createRolePermissionsService(rolePermissionsRepository);
export const requireSection = createRequireSection(rolePermissionsService);
