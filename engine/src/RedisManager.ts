import {type RedisClientType,createClient} from "redis"
import { ORDER_UPDATE, TRADE_ADDED } from "./types/index.js";
import type { WsMessage } from "./types/toWs.js";
import { ORDER, type MessageToApi } from "./types/toApi.js";
