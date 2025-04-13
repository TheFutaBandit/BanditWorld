import { Router } from 'express';
import { CreateSpaceSchema, DeleteSpaceSchema, AddElementSchema, DeleteElementSchema } from '../../types';
import { userCheckMiddleware } from '../../middlewares/user';
import client from '@repo/db/client';

export const spaceRouter = Router();

spaceRouter.post("/", userCheckMiddleware, async (req, res) => {
    

    const parsedMapData = CreateSpaceSchema.safeParse(req.body);
    
    if(!parsedMapData.success) {
        res.status(400).json({message: "Data couldn't be schema parsed"});
        return;
    }

    const space_name = parsedMapData.data.name;
    const x = +parsedMapData.data.dimensions.split('x')[0];
    const y = +parsedMapData.data.dimensions.split('x')[1];

    if(!parsedMapData.data.mapId) {
        const space = await client.space.create({
            data : {
                name: space_name,
                width: x,
                height: y,
                creatorId: req.userId!
            }
        })

        res.json({
            spaceId: space.id,
        })

        return;
    }

    const map = await client.map.findUnique({
        where : {
            id : parsedMapData.data.mapId
        }, select : {
            mapElements : true,
            width: true,
            height: true,
        }
    })

    if(!map) {
        res.send(400).json({
            message: "Map not found",
        })
        return;
    }
    
    const space = await client.$transaction(async() => {
        const space = await client.space.create({
            data : {
                name: space_name,
                width: map.width,
                height: map.height,
                creatorId: req.userId! //we don't know the reason for this
            }
        })

        await client.spaceElements.createMany({
            data : map.mapElements.map((m) => ({
                spaceId: space.id,
                elementId: m.elementId,
                x: m.x,
                y: m.y
            }))
        })

        return space;
    })

    res.json({
        spaceId: space.id
    })
    

})

//huge bugs in here, for example, placing delete /element on top of /:spaceId is only a temporary fix ok

spaceRouter.get("/all", userCheckMiddleware, async (req, res) => {
    const space = await client.space.findMany({
        where : {
            creatorId: req.userId
        }
    });

    if(!space) {
        res.status(400).json({
            message: "there be no space"
        })
        return;
    }

    res.json({
        spaces: space.map((m) => ({
            id: m.id,
            name: m.name,
            dimensions: `${m.width}x${m.height}`,
            thumbnail: m.thumbnail,
        }))
    })
})

spaceRouter.get("/:spaceId", userCheckMiddleware, async (req, res) => {
    const spaceId = req.params.spaceId as string;

    const space = await client.space.findUnique({
        where : {
            id: spaceId
        }
    })

    if(!space) {
        res.status(400).json({
            message: "Space not found"
        })
        return;
    }

    const space_elements = await client.spaceElements.findMany({
        where : {
            spaceId: spaceId
        }
    })

    res.json({
        name: space.name,
        dimensions: `${space.width}x${space.height}`,
        elements: space_elements.map((e) => ({
            id: e.id,
            x: e.x,
            y: e.y,
            element : client.element.findFirst({
                where: {
                    id: e.elementId
                }
            })
        }))
    })
}) 

spaceRouter.delete('/element', userCheckMiddleware, async (req, res) => {
    console.log(req);

    const parsedData = DeleteElementSchema.safeParse(req.body);

    if(!parsedData.success) {
        res.status(400).json({
            message: "Validation Failed"
        })
        return;
    }

    const elementId = parsedData.data.id;

    const spaceElement = await client.spaceElements.findFirst({
        where : {
            elementId: elementId,
        } , include :{
            space: true,
        }
    })

    if(!spaceElement) {
        res.status(400).json({
            message: "Element doesn't exist in space"
        })
        return;
    }

    if(!spaceElement.space.creatorId || spaceElement.space.creatorId !== req.userId) {
        res.status(403).json({
            message: "Unauthorized resource for the user"
        })
        return;
    }

    await client.spaceElements.delete({
        where : {
            id: spaceElement.id,
        }
    })

    res.json({
        message: "element deleted"
    })
})

spaceRouter.delete("/:spaceId", userCheckMiddleware, async (req, res) => {
    const parsedData = DeleteSpaceSchema.safeParse(req.params.spaceId);

    if(!parsedData.success) {
        res.status(400).json({
            message: "validation failed"
        })
        return;
    }
    
    const space_id = req.params.spaceId;

    try {
        const space = await client.space.findUnique({
            where : {
                id: space_id
            }, select : {
                creatorId: true,
            }
        })

        if(!space) {
            res.status(400).json({
                message: "no such space found"
            })
            return;
        }

        if(space.creatorId !== req.userId) {
            res.status(403).json({
                message: "Not authorized"
            })
            return;
        }

        await client.space.delete({
            where : {
                id : space_id
            }
        })

        res.json({
            message: space_id
        })
        
        return;
    } catch (e) {
        
        res.status(400).json({
            message: "no such space found"
        })
        return;
    }

})

spaceRouter.post('/element', userCheckMiddleware, async (req, res) => {
    const parsedData = AddElementSchema.safeParse(req.body);

    if(!parsedData.success) {
        res.status(400).json({
            message: "validation failed"
        })
        return;
    }

    try {
        const checkElement = await client.element.findFirst({
            where : {
                id: parsedData.data.elementId
            }
        });

        // console.log(checkElement);

        if(!checkElement) {
            res.status(400).json({
                message: "Element doesn't exist",
            })
            return;
        }
    } catch (e) {
        res.status(400).json({
            message: "This element doesn't exist"
        })
        return;
    }


    const element = await client.spaceElements.create({
        data : {
            elementId: parsedData.data.elementId,
            spaceId: parsedData.data.spaceId,
            x: parsedData.data.x,
            y: parsedData.data.y
        }
    })

    res.json({
        message: "Element Created in Space",
        element
    })
})  

