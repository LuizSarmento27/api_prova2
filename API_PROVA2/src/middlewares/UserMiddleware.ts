import { NextFunction, Response, Request } from "express";

class UserMiddleware{
    constructor(){

    }
    async verifyToken(req: Request, res: Response, next: NextFunction){
        const token = req.headers["authorization"];

        if(!token){
            return res.status(401).json({
                message: "O Token não foi autorizado."
            });
        }
        next(); 
    }
}

export default new UserMiddleware();