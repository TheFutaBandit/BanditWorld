import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../config";



export const adminCheckMiddleware = (req : Request, res : Response, next : NextFunction) => {
    const header = req.headers.authorization;
    const token = header?.split(" ")[1];

    if(!token || token === "undefined") {
        res.status(401).json({message:"Something wrong with the authentication"})
        return;
    }

    try {
        const decoded_payload = jwt.verify(token, JWT_PASSWORD) as { userId : string, userRole: string };

        const userId = decoded_payload.userId;
        const user_role = decoded_payload.userRole;

        if(user_role !== "Admin") {
            res.status(403).json({message: "A user is not authorized for this resource"})
            return;
        }

        req.userId = userId;
        next();

    } catch(e) {
        res.status(401).json({message:"bad token"});
    }
    


}