import { getCmsRolesRepository } from '@luxe-maison/database';
import { createCmsRolesService } from '@luxe-maison/core';
import { createRequireSection } from '../middleware/permissions.middleware.js';

const cmsRolesRepository = getCmsRolesRepository();

export const cmsRolesService = createCmsRolesService(cmsRolesRepository);

export const requireSection = createRequireSection(cmsRolesService);
