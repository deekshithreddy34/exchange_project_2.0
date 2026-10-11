
import { it, expect, vi, beforeEach } from "vitest";

vi.mock("pg", () => {
    const query = vi.fn();
    class Client {
        connect = vi.fn();
        query = query;   // every Client shares the same fake query
    }
    return { Client };
});

import { Client } from "pg";
import { tickersRouter } from "./tickers";

const mockQuery = new Client().query as any;

const getHandler = () =>
    (tickersRouter as any).stack.find(
        (l: any) => l.route?.path === "/" && l.route.methods.get
    ).route.stack[0].handle;

const mockRes = () => ({ json: vi.fn() });

beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
});

it("formats a DB row into a ticker", async () => {
    mockQuery.mockResolvedValue({
        rows: [{
            currency_code: "TATA",
            first_price: "100",
            last_price: "110",
            high: "120",
            low: "90",
            volume: "10",
            trades: 5,
        }],
    });
    const res = mockRes();

    await getHandler()({}, res);

    expect(res.json).toHaveBeenCalledWith([{
        symbol: "TATA_INR",
        firstPrice: "100.00",
        lastPrice: "110.00",
        high: "120.00",
        low: "90.00",
        volume: "10.00",
        quoteVolume: "1100.00",     // volume * lastPrice
        priceChange: "10.00",
        priceChangePercent: "10.00",
        trades: "5",
    }]);
});

it("returns 0 percent change when first price is 0", async () => {
    mockQuery.mockResolvedValue({
        rows: [{
            currency_code: "TATA",
            first_price: "0",
            last_price: "50",
            high: "50",
            low: "0",
            volume: "1",
            trades: 1,
        }],
    });
    const res = mockRes();

    await getHandler()({}, res);

    const [tickers] = res.json.mock.calls[0];
    expect(tickers[0].priceChangePercent).toBe("0");
    expect(tickers[0].priceChange).toBe("50.00");
});

it("returns an empty array when there are no rows", async () => {
    mockQuery.mockResolvedValue({ rows: [] });
    const res = mockRes();

    await getHandler()({}, res);

    expect(res.json).toHaveBeenCalledWith([]);
});

it("returns an empty array when the query fails", async () => {
    mockQuery.mockRejectedValue(new Error("db down"));
    const res = mockRes();

    await getHandler()({}, res);

    expect(res.json).toHaveBeenCalledWith([]);
});