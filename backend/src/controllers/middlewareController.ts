import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface CustomRequest extends Request {
  user: any;  
}

const middlewareController = {
  verifyToken: (req: CustomRequest, res: Response, next: NextFunction) => {
    const token = req.headers.token as string;
    if (token) {
      const accessToken = token.split(" ")[1];
      jwt.verify(accessToken, process.env.SECRET_KEY as string, (err: any, user: any) => {
        if (err) {
          return res.status(403).json("Token is not valid");
        }
        req.user = user;
        next();
      });
    } else {
      res.status(401).json("You are not authenticated!");
    }
  },

  verifyTokenAndAdminAuth: (req: CustomRequest, res: Response, next: NextFunction) => {
    middlewareController.verifyToken(req, res, () => {
      if (req.user.id === req.params.id || req.user.admin) {
        next();
      } else {
        res.status(403).json("You aren't allowed to delete");
      }
    });
  },
};

export default middlewareController;
