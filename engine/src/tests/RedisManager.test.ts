import { describe, it, expect, vi, beforeEach } from "vitest";

const mockLPush = vi.fn();
const mockPublish = vi.fn();
const mockConnect = vi.fn();

vi.mock("redis", () => ({
    createClient: vi.fn(() => ({
        connect: mockConnect,
        lPush: mockLPush,
        publish: mockPublish,
    })),
}));

import { RedisManager } from "./RedisManager.js";

describe("RedisManager", () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should push a message to Redis", () => {

        const redis = RedisManager.getInstance();

        const message = {
            type: "TRADE_ADDED" as const,
            data: {
                id: "123",
                isBuyerMaker: true,
                price: "50000",
                quantity: "1",
                quoteQuantity: "50000",
                timestamp: 123456,
                market: "BTC_USDT"
            }
        };

        redis.pushMessage(message);

        expect(mockLPush).toHaveBeenCalledWith(
            "db_processor",
            JSON.stringify(message)
        );
    });

    it("should publish a message to a channel", () => {

        const redis = RedisManager.getInstance();

        const message = {
            type: "DEPTH_UPDATE",
            data: {}
        } as any;

        redis.publishMessage("BTC_USDT", message);

        expect(mockPublish).toHaveBeenCalledWith(
            "BTC_USDT",
            JSON.stringify(message)
        );
    });

    it("should send message to API client", () => {

        const redis = RedisManager.getInstance();

        const message = {
            type: "ORDER_UPDATE",
            data: {}
        } as any;

        redis.sendToApi("client-123", message);

        expect(mockPublish).toHaveBeenCalledWith(
            "client-123",
            JSON.stringify(message)
        );
    });

});