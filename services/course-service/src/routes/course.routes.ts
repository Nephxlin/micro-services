import { Router } from 'express';
import { createCourse, getCourses, getCourseById, updateCourse, deleteCourse } from '../controllers/course.controller';

const router = Router();

// Create a new course
router.post('/', createCourse);

// Get all courses
router.get('/', getCourses);

// Get a single course by id
router.get('/:id', getCourseById);

// Update a course
router.put('/:id', updateCourse);

// Delete a course
router.delete('/:id', deleteCourse);

export default router; 