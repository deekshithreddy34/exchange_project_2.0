
import { describe, it, expect } from "vitest";
import { Orderbook, type Order } from "./Orderbook.js";

describe("Orderbook", () => {
    const createOrder = (
        orderId: string,
        userId: string,
        price: number,
        quantity: number,
        side: "buy" | "sell"
    ): Order => ({
        orderId,
        userId,
        price,
        quantity,
        side,
        filled: 0,
    });

    it("should return the correct ticker", () => {
        const book = new Orderbook("BTC", [], [], 0, 0);

        expect(book.ticker()).toBe("BTC_INR");
    });

    it("should return the current snapshot", () => {
        const book = new Orderbook("BTC", [], [], 5, 50000);

        expect(book.getSnapshot()).toEqual({
            baseAsset: "BTC",
            bids: [],
            asks: [],
            lastTradeId: 5,
            currentPrice: 50000,
        });
    });

    it("should add an unmatched buy order to bids", () => {
        const book = new Orderbook("BTC", [], [], 0, 0);
        const order = createOrder("1", "user1", 50000, 2, "buy");

        const result = book.addOrder(order);

        expect(result.executedQty).toBe(0);
        expect(book.bids).toContain(order);
        expect(book.asks).toHaveLength(0);
    });

    it("should match a buy order with a sell order at a lower price", () => {
        const ask = createOrder("ask1", "user2", 49000, 2, "sell");
        const book = new Orderbook("BTC", [], [ask], 0, 0);
        const bid = createOrder("bid1", "user1", 50000, 1, "buy");

        const result = book.addOrder(bid);

        expect(result.executedQty).toBe(1);
        expect(result.fills).toHaveLength(1);
        expect(result.fills[0].price).toBe("49000");
        expect(result.fills[0].qty).toBe(1);
        expect(ask.filled).toBe(1);
    });

    it("should not match orders belonging to the same user", () => {
        const ask = createOrder("ask1", "user1", 49000, 2, "sell");
        const book = new Orderbook("BTC", [], [ask], 0, 0);
        const bid = createOrder("bid1", "user1", 50000, 1, "buy");

        const result = book.addOrder(bid);

        expect(result.executedQty).toBe(0);
        expect(result.fills).toHaveLength(0);
        expect(book.bids).toContain(bid);
    });

    it("should return aggregated order depth by price", () => {
        const bid1 = createOrder("1", "user1", 50000, 2, "buy");
        const bid2 = createOrder("2", "user2", 50000, 3, "buy");
        const ask = createOrder("3", "user3", 51000, 4, "sell");

        const book = new Orderbook("BTC", [bid1, bid2], [ask], 0, 0);

        expect(book.getDepth()).toEqual({
            bids: [["50000", "5"]],
            asks: [["51000", "4"]],
        });
    });

    it("should return only open orders belonging to a user", () => {
        const bid = createOrder("1", "user1", 50000, 2, "buy");
        const ask = createOrder("2", "user1", 51000, 1, "sell");
        const otherBid = createOrder("3", "user2", 49000, 3, "buy");

        const book = new Orderbook("BTC", [bid, otherBid], [ask], 0, 0);

        expect(book.getOpenOrders("user1")).toEqual([ask, bid]);
    });

    it("should cancel a bid and return its price", () => {
        const bid = createOrder("1", "user1", 50000, 2, "buy");
        const book = new Orderbook("BTC", [bid], [], 0, 0);

        expect(book.cancelBid(bid)).toBe(50000);
        expect(book.bids).toHaveLength(0);
    });

    it("should cancel an ask and return its price", () => {
        const ask = createOrder("1", "user1", 51000, 2, "sell");
        const book = new Orderbook("BTC", [], [ask], 0, 0);

        expect(book.cancelAsk(ask)).toBe(51000);
        expect(book.asks).toHaveLength(0);
    });
});
