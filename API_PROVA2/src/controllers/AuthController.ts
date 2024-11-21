import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { CreateHashPassword, CheckUserPassword } from "../utils/HashPassword";
import { generateJWToken } from "../utils/JWT";
import { decodeToken } from "../utils/JWT";

const prisma = new PrismaClient();

class AuthController{
    constructor(){}

    async me(req: Request, res: Response){
        try{
            const token = req.body.token;
            const decodedUser = await decodeToken(token);
            return res.json({
                status: 200,
                user: decodedUser
            })
            
        }catch(e){
            return res.json({
                status: 500,
                message: "Ocorreu um erro."
            })
        }
    }
    async signIn(req: Request, res: Response){
        try{
            const { email, password } = req.body;

            if(!email || !password){
                return res.json({
                    status: 400,
                    message: "Email ou senha não informados."
                })
            }

            const user = await prisma.user.findFirst({
                where: {
                    email
                }
            })

            if(!user){
                return res.json({
                    status: 404,
                    message: "Não existe usuario com esse email"
                })
            }
            
            const passwordChecks = await CheckUserPassword(password, user.password)

            if(!passwordChecks){
                return res.json({
                    status: 401,
                    message: "Senha incorreta."
                })
            }

            const token = await generateJWToken(user)
            return res.json({
                status: 200,
                token: token,
                usuario: user,
                message: "Autenticação bem sucedida."
            })

        }catch(error){
            console.log(error);
            return res.status(500).json({
                error: error
            })
        }
        
        
    }
    async signUp(req: Request, res: Response){
        try{
        const userData = req.body
        const email = userData.email

        const userExists = await prisma.user.findFirst({
            where: {
                email
            }
        })

        if(!email || !userData.password){
            return res.json({
                status: 400,
                message: "Email ou senha não inseridos."
            })
        }
        
        if(userExists){
            return res.json({
                status: 400,
                message: "Este email já está sendo usado."
            })
        }
        
        userData.password = await CreateHashPassword(userData.password)

        await prisma.user.create({
            data: userData
        })

        return res.json({
            status: 201,
            message: "Usuário criado com sucesso."
        })

        }catch(error){
            console.log(error);
            return res.status(500).json({
                error: error
            })
        }
    }
    async signOut(){

    }
}

export default new AuthController()