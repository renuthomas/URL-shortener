import { RateLimiterClient } from "./rateLimiter.client.js";
import redisClient from "../redis/redis.utils.js";

const rateLimiterObj=new RateLimiterClient(redisClient,"./utils/redis/scripts/rateLimiter.lua");
await rateLimiterObj.loadScript();

export {rateLimiterObj};