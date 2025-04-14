import { OutgoingMesasge } from "./types/index";
import type { User } from "./User"

export class RoomManager {
   rooms: Map<string, User[]> = new Map();

   static instance : RoomManager;

   private constructor() {
        this.rooms = new Map();
   }

   static getInstance() {
        if(!this.instance) {
            this.instance = new RoomManager();
        }
        return this.instance;
   }

    addUser(User : User, spaceId : string) {
        if(!this.rooms.has(spaceId)) {
            this.rooms.set(spaceId, [User]);
            return;
        }
        this.rooms.set(spaceId, [...(this.rooms.get(spaceId)??[]), User])
    }

    removeUser(User: User, spaceId : string) {
        this.rooms.set(spaceId, ((this.rooms.get(spaceId))?.filter((user) => user.userId != User.userId)) ?? []);
    }

    public broadcastMessage(message : OutgoingMesasge, spaceId : string, User : User) {
        if(!this.rooms.has(spaceId)) {
            return;
        }
        this.rooms.get(spaceId)?.forEach((u) => {
            if(u.userId != User.userId) {
                u.Send(message);
            }
        })
    }
}