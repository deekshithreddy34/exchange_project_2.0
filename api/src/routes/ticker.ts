import { Router } from "express";
import { Client } from "pg";

const pgClient = new Client({
    user: process.env.DB_USER || 'your_user',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'my_database',
    password: process.env.DB_PASSWORD || 'your_password',
    port: Number(process.env.DB_PORT) || 5432,
});
pgClient.connect();

export const tickersRouter = Router();

tickersRouter.get("/", async (req, res) => {
    try {
        const result = await pgClient.query(`
            SELECT
                currency_code,
                first(price, time) AS first_price,
                last(price, time) AS last_price,
                max(price) AS high,
                min(price) AS low,
                sum(volume) AS volume,
                count(*) AS trades
            FROM tata_prices
            WHERE time >= NOW() - INTERVAL '24 hours'
            GROUP BY currency_code
        `);

        const tickers = result.rows.map(row => {
            const lastPrice = parseFloat(row.last_price) || 0;
            const firstPrice = parseFloat(row.first_price) || 0;
            const priceChange = (lastPrice - firstPrice).toFixed(2);
            const priceChangePercent = firstPrice ? (((lastPrice - firstPrice) / firstPrice) * 100).toFixed(2) : "0";
            return {
                symbol: `${row.currency_code}_INR`,
                firstPrice: firstPrice.toFixed(2),
                lastPrice: lastPrice.toFixed(2),
                high: parseFloat(row.high).toFixed(2),
                low: parseFloat(row.low).toFixed(2),
                volume: parseFloat(row.volume).toFixed(2),
                quoteVolume: (parseFloat(row.volume) * lastPrice).toFixed(2),
                priceChange,
                priceChangePercent,
                trades: row.trades.toString(),
            };
        });

        res.json(tickers);
    } catch (err) {
        console.error(err);
        res.json([]);
    }
});