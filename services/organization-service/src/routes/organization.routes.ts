import { Router } from 'express';
import { createOrganization, getOrganization, updateOrganization, deleteOrganization, addMember, updateMemberRole, removeMember, getUserOrganizations } from '../controllers/organization.controller';
import { validateCreateOrganization, validateUpdateOrganization, validateAddMember, validateUpdateMemberRole, validateUUID } from '../middleware/organization.validator';

const router = Router();

// Organization routes
router.route('/')
  .post(validateCreateOrganization, createOrganization)
  .get(getUserOrganizations);

router.route('/:id')
  .get(validateUUID, getOrganization)
  .put(validateUUID, validateUpdateOrganization, updateOrganization)
  .delete(validateUUID, deleteOrganization);

// Organization members routes
router.route('/:organizationId/members')
  .post(validateUUID, validateAddMember, addMember);

router.route('/:organizationId/members/:memberId')
  .put(validateUUID, validateUpdateMemberRole, updateMemberRole)
  .delete(validateUUID, removeMember);

export default router; 