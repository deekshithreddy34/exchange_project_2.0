
import {type RedisClientType,createClient} from "redis"
import { type MessageFromOrderbook } from "./types/index.js"
import {type MessageToEngine} from "./types/to.js" 
import { create } from "domain";

export class RedisManager{
    private client:RedisClientType;
    private publisher:RedisClientType;
    private static instance : RedisManager

    private constructor(){
        this.client=createClient({url: process.env.REDIS_URL || 'redis://localhost:6379'})
        this.client.connect()
        this.publisher=createClient({url: process.env.REDIS_URL || 'redis://localhost:6379'})
        this.publisher.connect
    }

    public static getInstance(){
        if(!this.instance){
            this.instance=new RedisManager()
        }

        return this.instance;
    }

    public sendAndAwait(message:MessageToEngine){
        
    }

    public getrandomClientId(){

    }
}