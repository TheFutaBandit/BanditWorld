import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../config";



export const userCheckMiddleware = (req : Request, res : Response, next : NextFunction) => {
    const header = req.headers.authorization;
    const token = header?.split(" ")[1];

    // console.log(token);

    if(!token || token === "undefined") {
        console.log("invalid token");
        res.status(401).json({message:"Something wrong with the authentication"})
        return;
    }

    try {
        const decoded_payload = jwt.verify(token, JWT_PASSWORD) as { userId : string, userRole: string };

        const userId = decoded_payload.userId;
        const user_role = decoded_payload.userRole;

        if(user_role !== "User" && user_role !== "Admin") {
            res.status(403).json({message: "You are not authorized for this resource"})
            return;
        }

        req.userId = userId;
        next();

    } catch(e) {
        console.log("bad token");
        res.status(401).json({message:"bad token"});
        return;
    }
    


}