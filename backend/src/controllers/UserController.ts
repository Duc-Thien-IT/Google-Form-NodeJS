import { Request, Response } from "express";
import User from "../models/User";

const userController = {
    getAllUsers: async(req: Request, res: Response): Promise<void> => {
        try{
            const user = await User.findAll();
            res.status(200).json(user);
        }
        catch(err){
            console.error('Error fetching users: ', err);
            res.status(500).json(err);
        }
    },

    getUser: async(req: Request, res: Response):  Promise<void> => {
        try{
            const user = await User.findByPk(req.params.id);
            if(!user){
                res.status(404).json("User not found");
            }
            res.status(200).json(user);
        }
        catch(err){
            res.status(500).json({ err:"Err"});
        }
    },

    deleteUser: async(req: Request, res: Response): Promise<void> => {
        try{
            const user = await User.findByPk(req.params.id);
            if(!user) {
                res.status(404).json("User not found");
                return;
            }

            await user.destroy();

            res.status(200).json("User deleted successfully");
        }
        catch(err)
        {
            res.status(500).json({ err: "Err" });
        }
    }
}

export default userController;
