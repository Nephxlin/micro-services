import { Request, Response } from 'express';
import { OrganizationService } from '../services/organization.service';
import { CreateOrganizationDto, UpdateOrganizationDto, AddMemberDto, UpdateMemberRoleDto } from '../types/organization.types';

const organizationService = new OrganizationService();

export const createOrganization = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const dto: CreateOrganizationDto = req.body;
    const organization = await organizationService.createOrganization(userId, dto);
    res.status(201).json(organization);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unexpected error occurred' });
    }
  }
};

export const getOrganization = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const organization = await organizationService.getOrganization(id);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    res.json(organization);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unexpected error occurred' });
    }
  }
};

export const updateOrganization = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const dto: UpdateOrganizationDto = req.body;
    const organization = await organizationService.updateOrganization(id, userId, dto);
    res.json(organization);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unexpected error occurred' });
    }
  }
};

export const deleteOrganization = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    await organizationService.deleteOrganization(id, userId);
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unexpected error occurred' });
    }
  }
};

export const addMember = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const dto: AddMemberDto = req.body;
    const member = await organizationService.addMember(organizationId, userId, dto);
    res.status(201).json(member);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unexpected error occurred' });
    }
  }
};

export const updateMemberRole = async (req: Request, res: Response) => {
  try {
    const { organizationId, memberId } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const dto: UpdateMemberRoleDto = req.body;
    const member = await organizationService.updateMemberRole(organizationId, memberId, userId, dto);
    res.json(member);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unexpected error occurred' });
    }
  }
};

export const removeMember = async (req: Request, res: Response) => {
  try {
    const { organizationId, memberId } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    await organizationService.removeMember(organizationId, memberId, userId);
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unexpected error occurred' });
    }
  }
};

export const getUserOrganizations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const organizations = await organizationService.getUserOrganizations(userId);
    res.json(organizations);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unexpected error occurred' });
    }
  }
};