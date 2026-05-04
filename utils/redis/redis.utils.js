import {Redis} from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const client=new Redis({
    password:process.env.REDIS_PASSWORD,
});

export default client;