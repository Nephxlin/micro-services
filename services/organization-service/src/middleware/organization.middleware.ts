import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Organization } from '@prisma/client';

const prisma = new PrismaClient();

declare global {
  namespace Express {
    interface Request {
      organization?: Organization;
    }
  }
}

export const validateOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Add validation logic specific to organization
    const data = req.body;
    
    // Example validation
    if (!data) {
      return res.status(400).json({ error: 'Request body is required' });
    }

    // Add more specific validation rules here
    // Example:
    // if (!data.name) {
    //   return res.status(400).json({ error: 'organization name is required' });
    // }

    next();
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const checkOrganizationExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: req.params.id }
    });

    if (!organization) {
      return res.status(404).json({ error: 'organization not found' });
    }

    // Attach the organization to the request object for use in subsequent middleware or route handlers
    req.organization = organization;
    next();
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Add more middleware functions specific to organization here