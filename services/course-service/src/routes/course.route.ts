import express from 'express';
import { authenticate, authorize } from '@auth-service/middleware/auth.middleware';
import { validateCourse, checkCourseExists } from '../middleware/course.middleware';
import * as courseController from '../controllers/course.controller';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: course
 *   description: course management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Course:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the course
 *       example:
 *         id: d290f1ee-6c54-4b01-90e6-d701748f0851
 */

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Get all courses
 *     tags: [course]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 */
router.get('/', authenticate, courseController.getAll);

/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     summary: Get course by id
 *     tags: [course]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: course id
 *     responses:
 *       200:
 *         description: course found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       404:
 *         description: course not found
 */
router.get('/:id', authenticate, checkCourseExists, courseController.getById);

/**
 * @swagger
 * /courses:
 *   post:
 *     summary: Create a new course
 *     tags: [course]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Course'
 *     responses:
 *       201:
 *         description: course created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 */
router.post('/', authenticate, authorize(['admin']), validateCourse, courseController.create);

/**
 * @swagger
 * /courses/{id}:
 *   put:
 *     summary: Update course by id
 *     tags: [course]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: course id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Course'
 *     responses:
 *       200:
 *         description: course updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       404:
 *         description: course not found
 */
router.put('/:id', authenticate, authorize(['admin']), checkCourseExists, validateCourse, courseController.update);

/**
 * @swagger
 * /courses/{id}:
 *   delete:
 *     summary: Delete course by id
 *     tags: [course]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: course id
 *     responses:
 *       204:
 *         description: course deleted successfully
 *       404:
 *         description: course not found
 */
router.delete('/:id', authenticate, authorize(['admin']), checkCourseExists, courseController.remove);

export default router;