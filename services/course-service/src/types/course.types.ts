import { Level } from '@prisma/client';

export interface CreateCourseDto {
  title: string;
  description?: string;
  price: number;
  duration: number;
  level: Level;
  published?: boolean;
  instructorId: string;
}

export interface UpdateCourseDto {
  title?: string;
  description?: string;
  price?: number;
  duration?: number;
  level?: Level;
  published?: boolean;
  instructorId?: string;
} 