import { Router } from 'express';
import { adminCheckMiddleware } from '../../middlewares/admin';
import { CreateElementSchema, CreateAvatarSchema, CreateMapSchema, UpdateElementSchema } from '../../types'
import client from '@repo/db/client'

export const adminRouter = Router();

adminRouter.post('/element', adminCheckMiddleware, async (req, res) => {
    const parsedData = CreateElementSchema.safeParse(req.body);

    if(!parsedData.success) {
        res.status(400).json({
            message: "validation Failed"
        })
        return;
    }

    const element = await client.element.create({
        data : {
            imageUrl: parsedData.data.imageUrl,
            width: parsedData.data.width,
            height: parsedData.data.height,
            static: parsedData.data.static
        }
    })

    res.json({
        id: element.id
    })
})

adminRouter.put('/element/:elementId', adminCheckMiddleware, async (req, res) => {
    const parsedData = UpdateElementSchema.safeParse(req.body);
    if(!parsedData.success) {
        res.status(400).json({
            message: "Validation Failed"
        })
        return;
    }

    // console.log(`elementId received is ${req.params.elementId}`)

    try {
        const elementUpdate = await client.element.update({
            where : {
                id: req.params.elementId
            }, data : {
                imageUrl: parsedData.data.imageUrl
            }
        })
        res.json({
            message: "successful update",
        })
    } catch (e) {
        res.status(400).json({
            message: "Failure in updating"
        })
    }

    
})  

adminRouter.post('/avatar', adminCheckMiddleware, async (req, res) => {
    const parsedData = CreateAvatarSchema.safeParse(req.body);
    if(!parsedData.success) {
        res.status(400).json({
            message: "Validation Failed"
        })
        return;
    }

    const avatarCreate = await client.avatar.create({
        data : {
            imageUrl : parsedData.data.imageUrl,
            name: parsedData.data.name
        }
    })

    if(!avatarCreate) {
        res.status(400).json({
            message: "Creation Error",
        })
    }

    res.json({
        avatarId: avatarCreate.id,
    })
    
})

adminRouter.post('/map', adminCheckMiddleware, async (req, res) => {
    const parsedData = CreateMapSchema.safeParse(req.body);

    if(!parsedData.success) {
        res.status(400).json({
            message: "Validation Failed",
        })
        return;
    }

    const mapCreate = await client.map.create({
        data : {
            imageUrl: parsedData.data.thumbnail,
            width: +(parsedData.data.dimensions.split('x')[0]),
            height: +(parsedData.data.dimensions.split('x')[1]),
            name: parsedData.data.name,
            mapElements: {
                create : parsedData.data.defaultElements.map((e) => ({
                    elementId: e.elementId,
                    x: e.x,
                    y: e.y,
                    
                }))
            }
        }
    })


    res.json({
        mapId: mapCreate.id
    })
})  

adminRouter.get('/map/:mapId/elements', adminCheckMiddleware, async (req, res) => {
    const mapId = req.params.mapId;

    try {
        const mapElements = await client.mapElements.findMany({
            where : {
                mapId: mapId,
            }
        })

        if(!mapElements) {
            res.status(400).json({
                message: "Map not found"
            })
            return;
        }

        res.json({
            elements: (mapElements.map((e) => e.elementId))
        })
        return;
    } catch (e) {
        res.status(400).json({
            message: "Map not found"
        })
        return;
    }
})