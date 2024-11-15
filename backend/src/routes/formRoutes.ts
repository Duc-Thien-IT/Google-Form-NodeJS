import express from 'express';
import { createForm, getUserForms, updateForm, deleteForm } from '../controllers/FormController';

const router = express.Router();

/**
 * @swagger
 * /forms:
 *   post:
 *     summary: Tạo một form mới
 *     tags: [Forms]
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
router.post('/forms', createForm);

/**
 * @swagger
 * /forms/users/{userId}:
 *   get:
 *     summary: Lấy tất cả form của người dùng
 *     tags: [Forms]
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
router.get('/forms/users/:userId', getUserForms);

/**
 * @swagger
 * /forms/{formId}:
 *   put:
 *     summary: Cập nhật thông tin form
 *     tags: [Forms]
 *     parameters:
 *       - in: path
 *         name: formId
 *         required: true
 *         description: ID của form cần cập nhật
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
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật form thành công
 *       404:
 *         description: Form không tồn tại hoặc bạn không có quyền sửa form này
 *       500:
 *         description: Lỗi khi cập nhật form
 */
router.put('/forms/:formId', updateForm);

/**
 * @swagger
 * /forms/{formId}:
 *   delete:
 *     summary: Xóa một form
 *     tags: [Forms]
 *     parameters:
 *       - in: path
 *         name: formId
 *         required: true
 *         description: ID của form cần xóa
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa form thành công
 *       404:
 *         description: Form không tồn tại hoặc bạn không có quyền xóa form này
 *       500:
 *         description: Lỗi khi xóa form
 */
router.delete('/forms/:formId', deleteForm);

export default router;
