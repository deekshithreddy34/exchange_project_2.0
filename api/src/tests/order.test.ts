import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../RedisManager", () => {
    const sendAndAwait = vi.fn();
    return { RedisManager: { getInstance: () => ({ sendAndAwait }) } };
});

import { RedisManager } from "../RedisManager.js";
import { orderRouter } from "../routes/order.js";
import { CREATE_ORDER, CANCEL_ORDER, GET_OPEN_ORDERS } from "../types/index.js";

const mockSendAndAwait = RedisManager.getInstance().sendAndAwait as any;

const getHandler = (method: string, path: string) =>
    (orderRouter as any).stack.find(
        (l: any) => l.route?.path === path && l.route.methods[method]
    ).route.stack[0].handle;

const mockRes = () => ({ json: vi.fn() });

beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
});

it("POST / sends CREATE_ORDER", async () => {
    mockSendAndAwait.mockResolvedValue({ payload: { orderId: "abc" } });
    const body = { market: "TATA_INR", price: "100", quantity: "5", side: "buy", userId: "1" };
    const res = mockRes();

    await getHandler("post", "/")({ body }, res);

    expect(mockSendAndAwait).toHaveBeenCalledWith({ type: CREATE_ORDER, data: body });
    expect(res.json).toHaveBeenCalledWith({ orderId: "abc" });
});

it("DELETE / sends CANCEL_ORDER", async () => {
    mockSendAndAwait.mockResolvedValue({ payload: { orderId: "abc" } });
    const res = mockRes();

    await getHandler("delete", "/")({ body: { orderId: "abc", market: "TATA_INR" } }, res);

    expect(mockSendAndAwait).toHaveBeenCalledWith({
        type: CANCEL_ORDER,
        data: { orderId: "abc", market: "TATA_INR" },
    });
    expect(res.json).toHaveBeenCalledWith({ orderId: "abc" });
});

it("GET /open sends GET_OPEN_ORDERS", async () => {
    mockSendAndAwait.mockResolvedValue({ payload: [] });
    const res = mockRes();

    await getHandler("get", "/open")({ query: { userId: "1", market: "TATA_INR" } }, res);

    expect(mockSendAndAwait).toHaveBeenCalledWith({
        type: GET_OPEN_ORDERS,
        data: { userId: "1", market: "TATA_INR" },
    });
    expect(res.json).toHaveBeenCalledWith([]);
});