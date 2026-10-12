import { Client } from 'pg';
import { Router } from "express";
import { RedisManager } from "../RedisManager";

const pgClient = new Client({
    user: process.env.DB_USER || 'your_user',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'my_database',
    password: process.env.DB_PASSWORD || 'your_password',
    port: Number(process.env.DB_PORT) || 5432,
});
pgClient.connect();

export const klineRouter = Router();

klineRouter.get("/", async (req, res) => {
    const { symbol, market, interval, startTime, endTime } = req.query;
    const marketSymbol = (symbol || market) as string;
    const currencyCode = marketSymbol ? marketSymbol.split("_")[0] : null;

    let query;
    switch (interval) {
        case '1m':
            query = currencyCode
                ? `SELECT * FROM klines_1m WHERE bucket >= $1 AND bucket <= $2 AND currency_code = $3`
                : `SELECT * FROM klines_1m WHERE bucket >= $1 AND bucket <= $2`;
            break;
        case '1h':
            query = currencyCode
                ? `SELECT * FROM klines_1h WHERE bucket >= $1 AND bucket <= $2 AND currency_code = $3`
                : `SELECT * FROM klines_1h WHERE bucket >= $1 AND bucket <= $2`;
            break;
        case '1w':
            query = currencyCode
                ? `SELECT * FROM klines_1w WHERE bucket >= $1 AND bucket <= $2 AND currency_code = $3`
                : `SELECT * FROM klines_1w WHERE bucket >= $1 AND bucket <= $2`;
            break;
        default:
            return res.status(400).send('Invalid interval');
    }

    try {
        //@ts-ignore
        const params: any[] = [new Date(startTime * 1000 as string), new Date(endTime * 1000 as string)];
        if (currencyCode) params.push(currencyCode);
        const result = await pgClient.query(query, params);
        res.json(result.rows.map(x => ({
            close: x.close,
            end: x.bucket,
            high: x.high,
            low: x.low,
            open: x.open,
            quoteVolume: x.quoteVolume ?? "0",
            start: x.bucket,
            trades: x.trades ?? "0",
            volume: x.volume,
        })));
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});