import { DataTypes, Sequelize, Model, Optional } from 'sequelize';
import sequelize from '../config/ConnectDB';
import Form from './Form';  // Import model Form

interface UserAttributes {
  id: string;
  username: string;
  email: string;
  password: string;
  admin: boolean;
  created_at: Date;
  updated_at: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public username!: string;
  public email!: string;
  public password!: string;
  public admin!: boolean;
  public created_at!: Date;
  public updated_at!: Date;

  static generateUserId(): string {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `US${randomNum}`;
  }
}

User.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      defaultValue: () => User.generateUserId(),
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
    tableName: 'users',
  }
);

// Quan hệ 1-Nhiều: Một User có thể có nhiều Form
User.hasMany(Form, {
  foreignKey: 'user_id',
  sourceKey: 'id', //khóa chính bảng user   
});

Form.belongsTo(User, {
  foreignKey: 'user_id', //khóa ngoại trỏ tới bảng form
  targetKey: 'id', //khóa chính user
});

export default User;
