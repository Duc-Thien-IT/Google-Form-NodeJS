import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerDocs from './swaggerOptions';
import swaggerUI from 'swagger-ui-express';

import middlewareController from './controllers/middlewareController';

import AuthRoutes from './routes/authRoutes';
import UserRoutes from './routes/userRoutes';
import formRoutes from './routes/formRoutes';
import path = require('path');

//==================================================
dotenv.config();

const app: Application = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

//swagger
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

//api routes
app.use("/v1/auth", AuthRoutes);
app.use("/v1/user", UserRoutes);
app.use("/v1/forms", formRoutes);

  
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});