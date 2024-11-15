import express, { Request, Response } from 'express';
import authController from '../controllers/authController';
import middlewareController from '../controllers/middlewareController';
import { Router } from 'express';

const router = Router();

/** POST Methods */

/**
 * @swagger
 * /v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user and return user data.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User registered successfully
 *       500:
 *         description: Registration failed
 */
router.post('/register', async (req, res) => {
    await authController.registerUser(req, res);
});

/**
 * @swagger
 * /v1/auth/login:
 *   post:
 *     summary: Login a user
 *     description: Login a user and return access and refresh tokens.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       404:
 *         description: Wrong username or password
 */
router.post('/login', async (req, res) => {
    await authController.loginUser(req, res);
});

/**
 * @swagger
 * /v1/auth/verify-otp:
 *   post:
 *     summary: Verify OTP
 *     description: Verify the OTP sent to the user's email.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: OTP verification failed
 *       500:
 *         description: Internal server error
 */
router.post('/verify-otp', async (req, res) => {
    await authController.verifyOtp(req, res);
});

router.post('/resend-otp', async (req, res) => {
    await authController.resendOtp(req, res);
});

/**
 * @swagger
 * /v1/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Refresh the access token using the refresh token.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       403:
 *         description: Token is not valid
 */
router.post('/refresh-token', async (req, res) => {
    authController.requestRefreshToken(req, res);
});

/**
 * @swagger
 * /v1/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Logout the current user and invalidate the token.
 *     tags: [Auth]
 *     security:
 *       - token: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: You are not authenticated
 */
router.post("/logout", middlewareController.verifyToken, (req: Request, res: Response) => authController.userLogout(req, res));

export default router;
