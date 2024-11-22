import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('test', 'postgres', '123456', {
  host: 'localhost',
  dialect: 'postgres',
});

sequelize.authenticate()
    .then(() => {
      console.log('Connection successfully');
    })
    .catch(err => {
      console.log('connection failed', err);
    })
    
export default sequelize;
