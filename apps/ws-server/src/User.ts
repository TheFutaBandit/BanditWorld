import random from "random-string-generator";
import { WebSocket } from "ws";
import { RoomManager } from "./RoomManager";
import client from "@repo/db/client"
import { OutgoingMesasge } from "./types/index";
import jwt, { JwtPayload } from 'jsonwebtoken';
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
        this.initHandler();
    }

    initHandler() {
        this.ws.on("message", async (event) => {
            const data = event.toString()
            
            console.log("Hey I have received a payload, I will start parsing it now");

            console.log(`Here's what the parsed data looks like:`);
            
            const parsedData = JSON.parse(data);
            
            console.log(parsedData);
            
            if(!parsedData) {
                return;
            }

            console.log("parse was successfull, let me try and make yall join or move");
         
            const RoomManagerInstance = RoomManager.getInstance();

            switch(parsedData.type) {
                case("join") : 
                    console.log("Hey the message was join, I will start the joining process");
                    const spaceId = parsedData.payload.spaceId;
                    const token = parsedData.payload.token;

                    const receivedId = (jwt.verify(token, JWT_SECRET) as JwtPayload).userId;

                    if(!receivedId) {
                        this.ws.close()
                        return;
                    }

                    this.userId = receivedId;

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
                    console.log(`User ${this.userId} has joined the space ${this.spaceId}`);
                    this.send({
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
                    })

                    // RoomManagerInstance.broadcastMessage(({
                    //     type: "user-join",
                    //     payload: {
                    //         userId: this.userId,
                    //         x: this.x,
                    //         y: this.y,
                    //     }
                    // }), this.spaceId!, this);

                    break;

                case("move") : 
                    const payload = parsedData.payload;

                   console.log("the payload is :" + payload);

                    console.log("hey the message was move, I will start the movement process");

                    if(!payload || !this.spaceId) {
                        return;
                    }

                    const newSpace = await client.space.findFirst({
                        where : {
                            id: this.spaceId
                        }
                    })

                    if(!newSpace) {
                        this.ws.close();
                        return;
                    }

                    console.log("I found the space!");

                    const maxWidth = newSpace.width;
                    const maxHeight = newSpace.height;



                    const newX : number = +(payload.x);
                    const newY : number = +(payload.y);
                    const distanceX = Math.abs(this.x - newX);
                    const distanceY = Math.abs(this.y - newY);

                    if(newX >= maxWidth || newY >= maxHeight) {
                        //out of bounds
                        console.log("movement is going to get rejected becaue it's out of bounds");
                        this.send({
                            type: "movement-rejected",
                            payload: {
                                x: this.x,
                                y: this.y
                            }
                        })
                        return;
                    }

                    if((distanceX === 0 && distanceY === 1) || (distanceX === 1 && distanceY === 0)) {
                        //movement acceptance check
                        console.log("this move has been accepted");
                        this.x = newX;
                        this.y = newY;
                        console.log("the user id before I broadcast the move is");
                        console.log(this.userId);
                        RoomManagerInstance.broadcastMessage(({
                            type: "movement",
                            payload: {
                                x: this.x,
                                y: this.y,
                                userId: this.userId
                            }
                        }), this.spaceId!, this)

                        
                        return;
                    }
                    

                    this.send({
                        type: "movement-rejected",
                        payload: {
                            x: this.x,
                            y: this.y
                        }
                    })

                    break;
            }   
        })
    }

    send(payload : OutgoingMesasge ) {
        console.log("I have received the message in the Send here, I am now sending it back to the clinet");
        this.ws.send(JSON.stringify(payload));
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