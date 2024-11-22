import { Model, DataType, Optional, DataTypes } from 'sequelize';
import sequelize from '../config/ConnectDB'; 
import User from './User';

interface RefreshTokenAttributes {
  id: number;
  user_id: string;
  token: string;
  expires_at: Date;
}

interface RefreshTokenCreationAttributes extends Optional<RefreshTokenAttributes, 'expires_at' | 'id'> {}


class RefreshToken extends Model<RefreshTokenAttributes, RefreshTokenCreationAttributes> implements RefreshTokenAttributes {
  public id!: number;
  public user_id !: string;
  public token!: string;
  public expires_at!: Date;

  public user?: User;
}

RefreshToken.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true, 
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Token',
    tableName: 'refresh_tokens',
    timestamps: true,
  }
);

RefreshToken.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

export default RefreshToken;