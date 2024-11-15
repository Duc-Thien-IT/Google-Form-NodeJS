import { Request, Response } from 'express';
import { Sequelize, Transaction } from 'sequelize';
import sequelize from '../config/ConnectDB';
import Form from '../models/Form';
import Question from '../models/Question';
import Answer from '../models/Answer';

export const createForm = async (req: Request, res: Response): Promise<void> => {
    const { title, description, questions, userId } = req.body;
    const transaction: Transaction = await sequelize.transaction();
    try {
        const newForm = await Form.create(
            {
                id: `FO${Math.floor(1000 + Math.random() * 9000)}`,
                title,
                description,
                user_id: userId,
                created_at: new Date(),
                updated_at: new Date(),
            },
            { transaction }
        );

        for (const question of questions) {
            const newQuestion = await Question.create(
                {
                    id: `QU${Math.floor(1000 + Math.random() * 9000)}`,
                    question_text: question.question_text,
                    form_id: newForm.id,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                { transaction }
            );

            for (const answer of question.answers) {
                await Answer.create(
                    {
                        id: `AN${Math.floor(1000 + Math.random() * 9000)}`,
                        answer_text: answer.answer_text,
                        is_correct: answer.is_correct,
                        question_id: newQuestion.id,
                        created_at: new Date(),
                        updated_at: new Date(),
                    },
                    { transaction }
                );
            }
        }

        await transaction.commit();
        res.status(201).json({
            message: 'Form created successfully!',
            form: newForm
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Error creating form:', error);
        res.status(500).json({
            message: 'Error creating form',
            error: (error as Error).message
        });
    }
};

export const getUserForms = async (req: Request, res: Response):Promise<void> => {
    const userId = req.params.userId;

    try {
        const forms = await Form.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: Question,
                    include: [Answer]
                }
            ]
        });

        if (!forms) {
            res.status(404).json({
                message: 'Forms not found.'
            });
        }

        res.status(200).json({
            message: 'Forms fetched successfully!',
            forms
        });
    } catch (error) {
        console.error('Error fetching forms:', error);
        res.status(500).json({
            message: 'Error fetching forms',
            error: (error as Error).message
        });
    }
};

export const updateForm = async (req: Request, res: Response):Promise<void> => {
    const formId = req.params.formId;
    const { title, description, questions, userId } = req.body;

    const transaction: Transaction = await sequelize.transaction();

    try {
        const form = await Form.findOne({ where: { id: formId, user_id: userId } });

        if (!form) {
             res.status(404).json({
                message: 'Form not found'
            });
            return
        }

        await form.update({ title, description, updated_at: new Date() }, { transaction });

        await Question.destroy({ where: { form_id: formId }, transaction });
        for (const question of questions) {
            const newQuestion = await Question.create(
                {
                    id: `QU${Math.floor(1000 + Math.random() * 9000)}`,
                    question_text: question.question_text,
                    form_id: formId,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                { transaction }
            );

            for (const answer of question.answers) {
                await Answer.create(
                    {
                        id: `AN${Math.floor(1000 + Math.random() * 9000)}`,
                        answer_text: answer.answer_text,
                        is_correct: answer.is_correct,
                        question_id: newQuestion.id,
                        created_at: new Date(),
                        updated_at: new Date(),
                    },
                    { transaction }
                );
            }
        }

        await transaction.commit();

         res.status(200).json({
            message: 'Form updated successfully!',
            form
        });

    } catch (error) {
        await transaction.rollback();

        console.error('Error update form:', error);
         res.status(500).json({
            message: 'Error update form',
            error: (error as Error).message
        });
    }
};

export const deleteForm = async (req: Request, res: Response):Promise<void> => {
    const formId = req.params.formId;
    const userId = req.body.userId;

    const transaction: Transaction = await sequelize.transaction();

    try {
        const form = await Form.findOne({ where: { id: formId, user_id: userId } });

        if (!form) {
             res.status(404).json({
                message: 'Form not found or you do not have permission to delete this form.'
            });
            return;
        }

        await form.destroy({ transaction });

        await transaction.commit();

         res.status(200).json({
            message: 'Form deleted successfully!'
        });

    } catch (error) {
        await transaction.rollback();

        console.error('Error delete form:', error);
         res.status(500).json({
            message: 'Error delete form',
            error: (error as Error).message
        });
    }
};

