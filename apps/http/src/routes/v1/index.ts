import { Router } from 'express';
import { userRouter } from './user'
import { spaceRouter } from './space'
import { adminRouter } from './admin'
import { SignInSchema, SignUpSchema } from '../../types';
import bcrypt from 'bcrypt';
import client from "@repo/db/client";
import jwt from 'jsonwebtoken';
import { JWT_PASSWORD } from '../../config';


export const indexRouter = Router();

indexRouter.post("/signup", async (req, res) => {
    const parsedData = SignUpSchema.safeParse(req.body);

    if(!parsedData.success) {
        res.status(400).json({message: "Validation Failed"})
        return;
    }

    const hashedPassword = await bcrypt.hash(parsedData.data.password, 10);

    try {
        let user = await client.user.create({
            data: {
                username: parsedData.data.username,
                password: hashedPassword,
                role: parsedData.data.type === "User" ? "User" : "Admin",
            }
        })

        res.json({
            userId: user.id,
        })

    } catch(e) {
        res.status(400).json({message: "Username already exists"});
    }
})

indexRouter.post("/signin", async (req, res) => {
    const parsedData = SignInSchema.safeParse(req.body);

    if(!parsedData.success) {
        res.status(400).json({message:"Validation Failed"});
        return;
    }

    try {
        const user = await client.user.findUnique({
            where: {
                username : parsedData.data.username
            }
        })

        if(!user) {
            res.status(400).json({message: "Invalid Username"});
            return;
        }  

        let truth = await bcrypt.compare(parsedData.data.password, user.password);

        if(!truth) {
            res.status(400).json({message: "Invalid password"});
            return;
        } 

        let userToken = jwt.sign({
            userId: user.id,
            userRole: user.role
        }, JWT_PASSWORD);

        res.json({
            token: userToken,
        })
               
    } catch (e) {
        res.status(403).json({message: "User counldn't be found in the database"});
    }    
})

indexRouter.get("/elements", async (req, res) => {
    const elements = await client.element.findMany();

    if(!elements) {
        res.status(400).json({
            message: "request failed"
        })
        return;
    }

    res.json({
        avatars: elements.map((e) => ({
            id: e.id,
            imageUrl: e.imageUrl,
            width: e.width,
            height: e.height,
            static: e.static
        }))
    })
})

indexRouter.get("/avatars", async (req, res) => {
    const avatars = await client.avatar.findMany();

    if(!avatars) {
        res.status(400).json({
            message: "request failed"
        })
        return;
    }

    res.json({
        avatars: avatars.map((a) => ({
            id: a.id,
            imageUrl: a.imageUrl,
            name: a.name
        }))
    })
})

indexRouter.use('/user', userRouter)
indexRouter.use('/admin', adminRouter)
indexRouter.use('/space', spaceRouter)

