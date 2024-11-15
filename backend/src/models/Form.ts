import { DataTypes, Sequelize, Model, Optional } from 'sequelize';
import sequelize from '../config/ConnectDB';
import User from './User';  // Import model User
import Question from './Question';  // Import model Question

interface FormAttributes {
  id: string;
  title: string;
  description: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

interface FormCreationAttributes extends Optional<FormAttributes, 'id'> {}

class Form extends Model<FormAttributes, FormCreationAttributes> implements FormAttributes {
  public id!: string;
  public title!: string;
  public description!: string;
  public user_id!: string;
  public created_at!: Date;
  public updated_at!: Date;
}

// Tạo model Form
Form.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      defaultValue: () => `FO${Math.floor(1000 + Math.random() * 9000)}`,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'users',
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
    tableName: 'forms',
  }
);

// Quan hệ 1-Nhiều: Một Form có thể có nhiều Question
Form.hasMany(Question, {
  foreignKey: 'form_id',
  sourceKey: 'id',
});

Question.belongsTo(Form, {
  foreignKey: 'form_id',
  targetKey: 'id',
});

export default Form;
