import { PrismaClient } from '@prisma/client';
import { CreateCourseDto, UpdateCourseDto } from '../types/course.types';

const prisma = new PrismaClient();

export class CourseService {
  async createCourse(data: CreateCourseDto) {
    return prisma.course.create({
      data
    });
  }

  async getCourses(published?: boolean) {
    return prisma.course.findMany({
      where: published !== undefined ? { published } : undefined
    });
  }

  async getCourseById(id: string) {
    return prisma.course.findUnique({
      where: { id }
    });
  }

  async updateCourse(id: string, data: UpdateCourseDto) {
    return prisma.course.update({
      where: { id },
      data
    });
  }

  async deleteCourse(id: string) {
    return prisma.course.delete({
      where: { id }
    });
  }
}