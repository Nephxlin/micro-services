import { Request, Response, NextFunction } from 'express';
import { OrgRole } from '../types/organization.types';

export const validateCreateOrganization = (req: Request, res: Response, next: NextFunction) => {
  const { name, description, logo, website } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  if (logo && !isValidUrl(logo)) {
    return res.status(400).json({ message: 'Logo must be a valid URL' });
  }

  if (website && !isValidUrl(website)) {
    return res.status(400).json({ message: 'Website must be a valid URL' });
  }

  next();
};

export const validateUpdateOrganization = (req: Request, res: Response, next: NextFunction) => {
  const { name, logo, website } = req.body;

  if (logo && !isValidUrl(logo)) {
    return res.status(400).json({ message: 'Logo must be a valid URL' });
  }

  if (website && !isValidUrl(website)) {
    return res.status(400).json({ message: 'Website must be a valid URL' });
  }

  next();
};

export const validateAddMember = (req: Request, res: Response, next: NextFunction) => {
  const { userId, role } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  if (role && !Object.values(OrgRole).includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  next();
};

export const validateUpdateMemberRole = (req: Request, res: Response, next: NextFunction) => {
  const { role } = req.body;

  if (!role || !Object.values(OrgRole).includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  next();
};

export const validateUUID = (req: Request, res: Response, next: NextFunction) => {
  const uuidParams = ['id', 'organizationId', 'memberId'];
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  for (const param of uuidParams) {
    if (req.params[param] && !uuidRegex.test(req.params[param])) {
      return res.status(400).json({ message: `Invalid ${param}` });
    }
  }

  next();
};

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
} 