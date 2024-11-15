import express, { Request, Response } from "express";
import middlewareController from "../controllers/middlewareController";
import userController from '../controllers/UserController';
import { Router } from 'express';

const router = Router();

/** GET Methods */
/**
 * @swagger
 * /v1/user:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users.
 *     tags: [Users]
 *     security:
 *       - token: []
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   username:
 *                     type: string
 *                   email:
 *                     type: string
 *       401:
 *         description: You aren't authenticated
 *       500:
 *         description: Internal server error
 */
router.get("/", middlewareController.verifyToken, userController.getAllUsers);


/**
 * @swagger
 * /v1/user/{id}:
 *   get:
 *     summary: Get a user by ID
 *     description: Retrieve a user by their ID.
 *     tags: [Users]
 *     security:
 *       - token: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties: 
 *                 id:
 *                   type: string
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *       404:
 *         description: User not found
 *       401:
 *         description: You aren't authenticated
 *       500:
 *         description: Internal server error
 */
router.get("/:id", middlewareController.verifyToken, userController.getUser);

export default router;


