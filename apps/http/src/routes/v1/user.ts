import { Router } from 'express';
import { UpdateMetadataSchema, UpdateMetadataIds } from "../../types/index";
import { adminCheckMiddleware } from '../../middlewares/admin';
import { userCheckMiddleware } from '../../middlewares/user';
import client from "@repo/db/client"

export const userRouter = Router();

userRouter.post('/metadata', adminCheckMiddleware, async (req, res) => {
    const parsedData = UpdateMetadataSchema.safeParse(req.body);

    if(!parsedData.success) {
        res.send(400).json({message: "Error in parsing data"});
        return;
    }

    try {
        const updateAvatar = await client.user.update({
            where: {
                id: req.userId
            },
            data : {
                avatarId: parsedData.data.avatarId
            }
        })

        if(!updateAvatar) {
            res.status(400).json({
                message: "Error querying"
            })
            return;
        }

        res.status(200).json({
            message: "Metadata Updated"
        })
        return;
    } catch (e) {
        res.status(400).json({
            message: "AvatarId doesn't exist"
        })
        return;
    }
});

userRouter.get('/metadata/bulk', userCheckMiddleware, async (req, res) => {
    
    // console.log(req.query.ids);

    const userIds = UpdateMetadataIds.safeParse(req.query.ids);

    // console.log(userIds);

    if(!userIds.success) {
        res.status(400).json({
            message: "No user Ids"
        })
        return;
    }

    const userIdArray = userIds.data.slice(1, userIds.data.length-1).split(",");


    try {
        const avatarArray = await client.user.findMany({
            where: {
                id: { in : userIdArray }
            },
            select: {
                id: true,
                avatarId: true,
            }
        })

        res.json({
            avatars: avatarArray.map((m) => {
                return {
                    userId: m.id,
                    avatarId: m.avatarId,
                }
            })
        })
        return;
    } catch(e) {
        res.status(400).json({
            message: "No user Ids"
        })
        return;
    }   

    
});