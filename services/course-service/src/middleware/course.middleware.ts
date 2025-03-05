import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const validateCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Add validation logic specific to course
    const data = req.body;
    
    // Example validation
    if (!data) {
      return res.status(400).json({ error: 'Request body is required' });
    }

    // Add more specific validation rules here
    // Example:
    // if (!data.name) {
    //   return res.status(400).json({ error: 'course name is required' });
    // }

    next();
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const checkCourseExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id }
    });

    if (!course) {
      return res.status(404).json({ error: 'course not found' });
    }

    // Attach the course to the request object for use in subsequent middleware or route handlers
    req.course = course;
    next();
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Add more middleware functions specific to course here