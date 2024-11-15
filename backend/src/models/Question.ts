import { DataTypes, Sequelize, Model, Optional } from 'sequelize';
import sequelize from '../config/ConnectDB';
import Form from './Form'; 
import Answer from './Answer'; 

interface QuestionAttributes {
  id: string;
  question_text: string;
  form_id: string;
  created_at: Date;
  updated_at: Date;
}

interface QuestionCreationAttributes extends Optional<QuestionAttributes, 'id'> {}

class Question extends Model<QuestionAttributes, QuestionCreationAttributes> implements QuestionAttributes {
  public id!: string;
  public question_text!: string;
  public form_id!: string;
  public created_at!: Date;
  public updated_at!: Date;
}

// Tạo model Question
Question.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      defaultValue: () => `QU${Math.floor(1000 + Math.random() * 9000)}`,
    },
    question_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    form_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'forms',
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
    tableName: 'questions',
  }
);

// Quan hệ 1-Nhiều: Một Question có thể có nhiều Answer
Question.hasMany(Answer, {
  foreignKey: 'question_id',
  sourceKey: 'id',
});

Answer.belongsTo(Question, {
  foreignKey: 'question_id',
  targetKey: 'id',
});

export default Question;
