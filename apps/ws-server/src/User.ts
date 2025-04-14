import random from "random-string-generator";
import { WebSocket } from "ws";
import { RoomManager } from "./RoomManager";
import client from "@repo/db/client"
import { OutgoingMesasge } from "./types/index";
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from "./config";


function getRandomGenerator(rLength : number) {
    const alphabetList = ["a","b","c","d","e","f","g","j"];

    let randomString = "";

    for(let i = 0; i < rLength; i++) {
        randomString += alphabetList[Math.floor(Math.random()*alphabetList.length)];
    }

    return randomString;
}   

export class User {
    public userId: string;
    private spaceId?: string;
    private x : number;
    private y : number;

    constructor(private ws: WebSocket) {
        this.userId = random(10);
        this.x = 0;
        this.y = 0;
    }

    initHandler() {
        this.ws.on("message", async (data) => {
            const parsedData = JSON.parse(JSON.stringify(data));

            if(!parsedData) {
                return;
            }

            const RoomManagerInstance = RoomManager.getInstance();

            switch(parsedData.type) {
                case("join") : 
                    const spaceId = parsedData.payload.spaceId;
                    const token = parsedData.payload.token;

                    const receivedId = jwt.verify(token, JWT_SECRET);

                    if(receivedId != this.userId) {
                        //verification failed
                        return;
                    }

                    const space = await client.space.findFirst({
                        where : {
                            id: spaceId
                        }
                    })
                    if(!space) {
                        this.ws.close();
                        return;
                    }
                    this.spaceId = spaceId;
                    RoomManagerInstance.addUser(this, spaceId);
                    this.x = Math.floor(Math.random()*space.width);
                    this.y = Math.floor(Math.random()*space.height)
                    this.ws.send(JSON.stringify({
                        type: "space-joined",
                        payload: {
                            spawn: {
                                x : this.x,
                                y : this.y
                            }
                        },
                        users: RoomManagerInstance.rooms.get(spaceId)?.map((u) => ({
                            id : u.userId
                        }))
                    }))

                    RoomManagerInstance.broadcastMessage(({
                        type: "user-join",
                        payload: {
                            userId: this.userId,
                            x: this.x,
                            y: this.y,
                        }
                    }), this.spaceId!, this);

                    break;

                case("move") : 
                    const payload = JSON.parse(JSON.stringify(data));

                    if(!payload || !spaceId) {
                        return;
                    }

                    const newX = payload.x;
                    const newY = payload.y;
                    const distanceX = Math.abs(this.x - newX);
                    const distanceY = Math.abs(this.y - newY);
                    if(distanceX === 1 && distanceY === 1) {
                        //movement reject check in above
                        this.ws.send(JSON.stringify({
                            type: "movement-rejected",
                            payload: {
                                x: this.x,
                                y: this.y
                            }
                        }))
                        return;
                    }
                    this.x = newX;
                    this.y = newY;
                    RoomManagerInstance.broadcastMessage(JSON.stringify({
                        type: "movement",
                        payload: {
                            x: this.x,
                            y: this.y,
                            userId: this.userId
                        }
                    }), this.spaceId!, this)

                    break;
            }   
        })
    }

    Send(message : OutgoingMesasge ) {
        this.ws.send(JSON.stringify(message));
    }

    destroy() {
        RoomManager.getInstance().removeUser(this, this.spaceId!);
        RoomManager.getInstance().broadcastMessage({
            type: "user-left",
            payload: {
                userId: this.userId
            }
        }, this.spaceId!, this)
        this.ws.close();
    }
}