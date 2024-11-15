import { DataTypes, Sequelize, Model, Optional } from 'sequelize';
import sequelize from '../config/ConnectDB';
import Question from './Question';  // Import model Question

interface AnswerAttributes {
  id: string;
  answer_text: string;
  is_correct: boolean;
  question_id: string;
  created_at: Date;
  updated_at: Date;
}

interface AnswerCreationAttributes extends Optional<AnswerAttributes, 'id'> {}

class Answer extends Model<AnswerAttributes, AnswerCreationAttributes> implements AnswerAttributes {
  public id!: string;
  public answer_text!: string;
  public is_correct!: boolean;
  public question_id!: string;
  public created_at!: Date;
  public updated_at!: Date;
}

// Tạo model Answer
Answer.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      defaultValue: () => `AN${Math.floor(1000 + Math.random() * 9000)}`,
    },
    answer_text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_correct: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    question_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'questions',
        key: 'id',
      },
    },
    created_at: {
      type: DataTypes.NOW,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.NOW,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    timestamps: false,
    tableName: 'answers',
  }
);

export default Answer;
