
import {it,describe,expect} from "vitest"
import { RedisManager } from "../RedisManager.js"

describe("RedisManager",()=>{
    const redis= RedisManager.getInstance()

    it("should return the same instance",()=>{
        expect(RedisManager.getInstance()).toBe(redis);
    })

    it("should generate different client Id",()=>{
        expect(redis.getrandomClientId()).toBeTruthy();
    })

    it("should generate different clietn ID'S",()=>{
        expect(redis.getrandomClientId()).not.toBe(
            redis.getrandomClientId()
        )
    })
})