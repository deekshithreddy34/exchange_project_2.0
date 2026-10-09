import { describe, it, expect, beforeEach, vi } from "vitest";
import { Engine } from "../trade/Engine.js";
import { BASE_CURRENCY } from "../trade/Engine.js";
import { afterEach } from "vitest";

// Mock RedisManager
const mockSendToApi = vi.fn();
const mockPushMessage = vi.fn();
const mockPublishMessage = vi.fn();

vi.mock("../RedisManager.ts", () => ({
    RedisManager: {
        getInstance: () => ({
            sendToApi: mockSendToApi,
            pushMessage: mockPushMessage,
            publishMessage: mockPublishMessage,
        }),
    },
}));


describe("Engine", () => {

    let engine: Engine;

    beforeEach(() => {
        vi.clearAllMocks();

        // Prevent the setInterval in Engine constructor
        vi.useFakeTimers();

        // Make sure we don't load snapshot.json
        delete process.env.WITH_SNAPSHOT;

        engine = new Engine();
    });


    describe("onRamp", () => {

        it("should create a balance for a new user", () => {

            engine.onRamp("100", 5000);

            const balances = (engine as any).balances;

            const userBalance = balances.get("100");

            expect(userBalance).toEqual({
                [BASE_CURRENCY]: {
                    available: 5000,
                    locked: 0,
                },
            });
        });


        it("should add money to an existing user's balance", () => {

            engine.onRamp("100", 5000);

            engine.onRamp("100", 3000);

            const balances = (engine as any).balances;

            const userBalance = balances.get("100");

            expect(userBalance[BASE_CURRENCY].available).toBe(5000 + 3000);
        });

    });


    describe("checkAndLockFunds", () => {

        it("should lock quote currency when buying", () => {

            engine.onRamp("100", 10000);

            engine.checkAndLockFunds(
                "BTC",
                "INR",
                "buy",
                "100",
                "INR",
                "100",
                "5"
            );

            const balances = (engine as any).balances;

            const userBalance = balances.get("100");

            expect(userBalance.INR.available).toBe(9500);

            expect(userBalance.INR.locked).toBe(500);
        });


        it("should throw an error when buyer has insufficient funds", () => {

            engine.onRamp("100", 100);

            expect(() => {
                engine.checkAndLockFunds(
                    "BTC",
                    "INR",
                    "buy",
                    "100",
                    "INR",
                    "100",
                    "5"
                );
            }).toThrow("Insufficient funds");
        });


        it("should lock base currency when selling", () => {

            const balances = (engine as any).balances;

            balances.get("100").BTC.available = 10;

            engine.checkAndLockFunds(
                "BTC",
                "INR",
                "sell",
                "100",
                "BTC",
                "100",
                "2"
            );

            const userBalance = balances.get("100");

            expect(userBalance.BTC.available).toBe(8);

            expect(userBalance.BTC.locked).toBe(2);
        });


        it("should throw an error when seller has insufficient assets", () => {

            const balances = (engine as any).balances;

            balances.get("100").BTC.available = 1;

            expect(() => {
                engine.checkAndLockFunds(
                    "BTC",
                    "INR",
                    "sell",
                    "100",
                    "BTC",
                    "100",
                    "2"
                );
            }).toThrow("Insufficient funds");
        });

    });


    describe("addOrderbook", () => {

        it("should add an orderbook", () => {

            const orderbooks = (engine as any).orderbooks;

            const initialLength = orderbooks.length;

            const fakeOrderbook = {
                ticker: () => "DOGE_INR",
            };

            engine.addOrderbook(fakeOrderbook as any);

            expect(orderbooks.length).toBe(initialLength + 1);
        });

    });


    describe("saveSnapshot", () => {

        it("should create a snapshot containing orderbooks and balances", () => {

            // We don't want to actually write a file in our test.
            // This test will be added after mocking fs.writeFileSync.
        });

    });

});