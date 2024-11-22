import express from 'express';
import { createForm, getUserForms, updateForm, deleteForm } from '../controllers/FormController';
import middlewareController from '../controllers/middlewareController';

const router = express.Router();

/**
 * @swagger
 * /v1/forms/createForm:
 *   post:
 *     summary: Create new Form
 *     description: Create a new form
 *     tags: [Forms]
 *     security:
 *       - token: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     question_text:
 *                       type: string
 *                     answers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           answer_text:
 *                             type: string
 *                           is_correct:
 *                             type: boolean
 *               userId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Form được tạo thành công
 *       500:
 *         description: Lỗi khi tạo form
 */
router.post('/createForm', middlewareController.verifyToken, createForm);

/**
 * @swagger
 * /v1/forms/users/{userId}:
 *   get:
 *     summary: Lấy tất cả form của người dùng
 *     description: Hiển thị form của người dùng này
 *     tags: [Forms]
 *     security:
 *       - token: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID người dùng
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lấy form thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 forms:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       user_id:
 *                         type: string
 *       404:
 *         description: Không tìm thấy form cho người dùng này
 *       500:
 *         description: Lỗi khi lấy form
 */
router.get('/users/:userId',  middlewareController.verifyToken, getUserForms);

/**
 * @swagger
 * /v1/forms/{userId}/{formId}:
 *   put:
 *     summary: Update a form
 *     description: Update a form by form ID and user ID
 *     tags: [Forms]
 *     security:
 *       - token: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *       - in: path
 *         name: formId
 *         required: true
 *         description: Form ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     question_text:
 *                       type: string
 *                     answers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           answer_text:
 *                             type: string
 *                           is_correct:
 *                             type: boolean
 *     responses:
 *       200:
 *         description: Form updated successfully
 *       404:
 *         description: Form not found or you do not have permission to update this form
 *       500:
 *         description: Error updating form
 */
router.put('/:userId/:formId', middlewareController.verifyToken, updateForm);

/**
 * @swagger
 * /v1/forms/{userId}/{formId}:
 *   delete:
 *     summary: Delete a form
 *     description: Delete a form by form ID and user ID
 *     tags: [Forms]
 *     security:
 *       - token: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *       - in: path
 *         name: formId
 *         required: true
 *         description: Form ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Form deleted successfully
 *       404:
 *         description: Form not found or you do not have permission to delete this form
 *       500:
 *         description: Error deleting form
 */
router.delete('/:userId/:formId', middlewareController.verifyToken, deleteForm);

export default router;